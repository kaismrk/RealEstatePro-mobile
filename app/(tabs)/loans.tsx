/**
 * Loan Simulator screen — Hovioo mobile
 *
 * Design reference: docs/design/loan-simulator/loan-simulation-page-proposal/project/Loan Simulation.dc.html
 * Implements: Turn 2 — Loan Simulation v2 (section 2a)
 *
 * Country-parametrised: all numeric ranges, rates, and eligibility rules come
 * from hooks/useLoanConfig.ts → lib/loan/config.ts. No hardcoded values in JSX.
 *
 * Persistence: SimState (inputs + saved simulations) is saved to SecureStore
 * under key `hovioo.loan.lastSim` so the user reopens where they left off.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Info, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { fontSize, fontWeight, radius, SAFE_TOP, spacing } from '@/constants/theme';
import { useLoanConfig } from '@/hooks/useLoanConfig';
import {
  calculateMonthlyPayment,
  calculateTotalInterest,
  calculateTransactionCosts,
  computeCost,
  fmt,
  fmt2,
} from '@/lib/loan/math';
import type { LoanCountryConfig, PropertyType } from '@/lib/loan/config';
import { useTheme } from '@/lib/theme';
import type { Palette } from '@/constants/theme';
import { secureStorage } from '@/lib/utils/secureStorage';

// ── Persistence ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'hovioo.loan.lastSim';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SavedSim {
  id: number;
  title: string;
  sub: string;
  monthly: number;
}

interface PersistedState {
  price: number;
  downPct: number;
  years: number;
  rateOverride: number | null;
  netIncome: number;
  otherLoans: number;
  marketType: PropertyType;
  savedSims: SavedSim[];
}

// ── Custom Slider ─────────────────────────────────────────────────────────────

interface LoanSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  palette: Palette;
  testID?: string;
}

const LoanSlider = React.memo(function LoanSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  palette,
  testID,
}: LoanSliderProps) {
  const trackRef = useRef<View>(null);
  const trackX = useRef(0);
  const trackW = useRef(280);

  // Keep mutable refs so PanResponder closure always reads latest values
  const minRef = useRef(min);
  const maxRef = useRef(max);
  const stepRef = useRef(step);
  const onChangeRef = useRef(onChange);
  useEffect(() => { minRef.current = min; }, [min]);
  useEffect(() => { maxRef.current = max; }, [max]);
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const applyTouch = useCallback((pageX: number) => {
    const relX = pageX - trackX.current;
    const ratio = Math.max(0, Math.min(1, relX / trackW.current));
    const raw = ratio * (maxRef.current - minRef.current) + minRef.current;
    const stepped = Math.round(raw / stepRef.current) * stepRef.current;
    onChangeRef.current(Math.min(maxRef.current, Math.max(minRef.current, stepped)));
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => applyTouch(e.nativeEvent.pageX),
      onPanResponderMove: (e) => applyTouch(e.nativeEvent.pageX),
    })
  ).current;

  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));

  return (
    <View
      ref={trackRef}
      testID={testID}
      style={[sliderStyles.track, { backgroundColor: palette.neutral200 }]}
      onLayout={() => {
        trackRef.current?.measure((_, __, w, ___, px) => {
          trackX.current = px;
          trackW.current = w;
        });
      }}
      {...panResponder.panHandlers}
    >
      {/* Fill bar */}
      <View
        style={[
          sliderStyles.fill,
          // eslint-disable-next-line react-native/no-inline-styles
          { width: `${pct * 100}%`, backgroundColor: palette.primary },
        ]}
      />
      {/* Thumb */}
      <View
        style={[
          sliderStyles.thumb,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            left: `${pct * 100}%` as unknown as number,
            marginLeft: -11,
            backgroundColor: palette.surface,
            borderColor: palette.primary,
          },
        ]}
      />
    </View>
  );
});

const sliderStyles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 999,
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
  },
  thumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    top: '50%',
    marginTop: -11,
  },
});

// ── Swipeable row (saved simulations) ────────────────────────────────────────

interface SwipeableSimRowProps {
  sim: SavedSim;
  onDelete: () => void;
  palette: Palette;
  currency: string;
  testID?: string;
}

const SwipeableSimRow = React.memo(function SwipeableSimRow({
  sim,
  onDelete,
  palette,
  currency,
  testID,
}: SwipeableSimRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
      onPanResponderMove: (_, g) => {
        translateX.setValue(Math.min(0, Math.max(-96, g.dx)));
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -60) {
          Animated.spring(translateX, {
            toValue: -84,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View
      testID={testID}
      style={[swipeStyles.wrapper, { borderRadius: radius.lg }]}
    >
      {/* Delete backdrop */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          swipeStyles.deleteBack,
          { backgroundColor: palette.error, borderRadius: radius.lg },
        ]}
      >
        <TouchableOpacity
          style={swipeStyles.deleteBtn}
          onPress={onDelete}
          testID={`sim-delete-${sim.id}`}
          accessibilityRole="button"
        >
          <Trash2 size={20} color="#fff" strokeWidth={1.75} />
        </TouchableOpacity>
      </View>
      {/* Swipeable card */}
      <Animated.View
        style={[
          swipeStyles.card,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
            borderRadius: radius.lg,
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={swipeStyles.cardBody}>
          <Text
            style={[swipeStyles.cardTitle, { color: palette.textPrimary }]}
            numberOfLines={1}
          >
            {sim.title}
          </Text>
          <Text
            style={[swipeStyles.cardSub, { color: palette.textSecondary }]}
            numberOfLines={1}
          >
            {sim.sub}
          </Text>
        </View>
        <Text style={[swipeStyles.cardMonthly, { color: palette.primary }]}>
          {fmt(sim.monthly)} {currency}/mo
        </Text>
      </Animated.View>
    </View>
  );
});

const swipeStyles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 10,
  },
  deleteBack: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 84,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  cardSub: {
    fontSize: fontSize.xs,
  },
  cardMonthly: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    flexShrink: 0,
  },
});

// ── Ad Placeholder ─────────────────────────────────────────────────────────────

function AdBanner({
  height,
  palette,
  label,
  sub,
}: {
  height: number;
  palette: Palette;
  label: string;
  sub: string;
}) {
  return (
    <View
      style={[
        adStyles.container,
        {
          minHeight: height,
          borderColor: palette.neutral300,
          backgroundColor: palette.neutral100,
          borderRadius: radius.lg,
        },
      ]}
    >
      <View style={adStyles.badge}>
        <Text style={[adStyles.badgeText, { color: palette.neutral400 }]}>AD</Text>
      </View>
      <Text style={[adStyles.label, { color: palette.textSecondary }]}>{label}</Text>
      <Text style={[adStyles.sub, { color: palette.textTertiary }]}>{sub}</Text>
    </View>
  );
}

const adStyles = StyleSheet.create({
  container: {
    position: 'relative',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    flexShrink: 0,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 10,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.08 * 10,
    borderWidth: 1,
    borderColor: '#d3d3db',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
  },
  sub: {
    fontSize: 11,
  },
});

// ── Segment selector ──────────────────────────────────────────────────────────

function SegmentControl({
  options,
  activeIndex,
  onSelect,
  palette,
  testIDPrefix,
}: {
  options: string[];
  activeIndex: number;
  onSelect: (i: number) => void;
  palette: Palette;
  testIDPrefix?: string;
}) {
  return (
    <View
      style={[
        segStyles.container,
        { backgroundColor: palette.neutral100, borderRadius: radius.sm },
      ]}
    >
      {options.map((label, i) => {
        const on = i === activeIndex;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => onSelect(i)}
            testID={testIDPrefix ? `${testIDPrefix}-${i}` : undefined}
            style={[
              segStyles.option,
              {
                backgroundColor: on ? palette.surface : 'transparent',
                borderRadius: radius.xs + 2,
              },
            ]}
            accessibilityRole="button"
          >
            <Text
              style={[
                segStyles.label,
                { color: on ? palette.primary : palette.textSecondary },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const segStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 3,
    gap: 3,
  },
  option: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  label: {
    fontSize: 12.5,
    fontWeight: fontWeight.semibold,
  },
});

// ── Inline text input row ─────────────────────────────────────────────────────

function LoanTextInput({
  value,
  onChangeText,
  suffix,
  palette,
  testID,
  keyboardType = 'decimal-pad',
}: {
  value: string;
  onChangeText: (text: string) => void;
  suffix?: string;
  palette: Palette;
  testID?: string;
  keyboardType?: 'decimal-pad' | 'number-pad';
}) {
  return (
    <View
      style={[
        inputStyles.row,
        {
          borderColor: palette.borderStrong,
          backgroundColor: palette.neutral100,
          borderRadius: radius.sm,
        },
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={[inputStyles.field, { color: palette.textPrimary }]}
        testID={testID}
        selectTextOnFocus
      />
      {!!suffix && (
        <Text style={[inputStyles.suffix, { color: palette.textTertiary }]}>
          {suffix}
        </Text>
      )}
    </View>
  );
}

const inputStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  field: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 17,
    fontWeight: fontWeight.bold,
  },
  suffix: {
    fontSize: 12.5,
    fontWeight: fontWeight.semibold,
    marginLeft: 4,
  },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function LoansScreen() {
  const { t } = useTranslation();
  const { palette } = useTheme();
  const config: LoanCountryConfig = useLoanConfig();

  // ── Local state ─────────────────────────────────────────────────────────────
  const [hydrated, setHydrated] = useState(false);
  const [price, setPrice] = useState(250_000);
  const [downPct, setDownPct] = useState(config.defaultDownPaymentPercent);
  const [years, setYears] = useState(config.defaultLoanTermYears);
  const [rateOverride, setRateOverride] = useState<number | null>(null);
  const [netIncome, setNetIncome] = useState(4500);
  const [otherLoans, setOtherLoans] = useState(0);
  const [marketType, setMarketType] = useState<PropertyType>('secondary');
  const [moreOpen, setMoreOpen] = useState(false);
  const [discOpen, setDiscOpen] = useState(false);
  const [ratioInfoOpen, setRatioInfoOpen] = useState(false);
  const [savedSims, setSavedSims] = useState<SavedSim[]>([]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const effectiveRate = rateOverride ?? config.defaultInterestRate;
  const bankMarginDisplay = +(effectiveRate - config.tmmRate).toFixed(2);
  const loanAmount = Math.max(0, price * (1 - downPct / 100));
  const downAmount = price * downPct / 100;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, effectiveRate, years);
  const totalLoanCost = monthlyPayment * years * 12;
  const totalInterest = calculateTotalInterest(loanAmount, monthlyPayment, years);

  // Transaction costs — computed from config, filtered by marketType
  const txAmount = useMemo(
    () => calculateTransactionCosts(price, loanAmount, config.transactionCosts, marketType),
    [price, loanAmount, config.transactionCosts, marketType],
  );

  const grandTotal = totalLoanCost + txAmount;

  // Breakdown bar widths
  const barTotal = totalLoanCost + txAmount;
  const principalW = barTotal > 0 ? `${(loanAmount / barTotal) * 100}%` : '40%';
  const interestW = barTotal > 0 ? `${(totalInterest / barTotal) * 100}%` : '40%';

  // Eligibility
  const totalMonthlyDebt = monthlyPayment + otherLoans;
  const debtRatio = netIncome > 0 ? totalMonthlyDebt / netIncome : 1;
  const isEligible = debtRatio <= config.eligibility.maxDebtToIncomeRatio;
  const isWarning = isEligible && debtRatio > config.eligibility.warnDebtToIncomeRatio;
  const ratioColor = !isEligible
    ? palette.error
    : isWarning
    ? palette.warning
    : palette.success;
  const eligBg = !isEligible
    ? palette.errorBg
    : isWarning
    ? palette.warningBg
    : palette.successBg;
  const eligFg = !isEligible
    ? palette.error
    : isWarning
    ? palette.warningText
    : palette.success;

  const maxRatioPct = config.eligibility.maxDebtToIncomeRatio * 100;
  const maxRatioBarW = `${maxRatioPct}%` as const;
  const ratioBarW = `${Math.min(100, debtRatio * 100)}%` as const;

  // ── SecureStore hydration ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    void secureStorage.getItem(STORAGE_KEY).then((raw) => {
      if (cancelled || !raw) {
        setHydrated(true);
        return;
      }
      try {
        const stored = JSON.parse(raw) as Partial<PersistedState>;
        if (typeof stored.price === 'number') setPrice(stored.price);
        if (typeof stored.downPct === 'number') setDownPct(stored.downPct);
        if (typeof stored.years === 'number') setYears(stored.years);
        if (stored.rateOverride !== undefined) setRateOverride(stored.rateOverride);
        if (typeof stored.netIncome === 'number') setNetIncome(stored.netIncome);
        if (typeof stored.otherLoans === 'number') setOtherLoans(stored.otherLoans);
        if (stored.marketType === 'new' || stored.marketType === 'secondary') {
          setMarketType(stored.marketType);
        }
        if (Array.isArray(stored.savedSims)) setSavedSims(stored.savedSims);
      } catch {
        // malformed — start fresh
      }
      setHydrated(true);
    });
    return () => { cancelled = true; };
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── SecureStore persistence ────────────────────────────────────────────────
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const state: PersistedState = {
        price, downPct, years, rateOverride,
        netIncome, otherLoans, marketType, savedSims,
      };
      void secureStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 600);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [
    hydrated, price, downPct, years, rateOverride,
    netIncome, otherLoans, marketType, savedSims,
  ]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleIncrRate = useCallback(() => {
    setRateOverride(prev => {
      const cur = prev ?? config.defaultInterestRate;
      return Math.min(config.maxInterestRate, +(cur + config.rateStep).toFixed(2));
    });
  }, [config]);

  const handleDecrRate = useCallback(() => {
    setRateOverride(prev => {
      const cur = prev ?? config.defaultInterestRate;
      return Math.max(config.minInterestRate, +(cur - config.rateStep).toFixed(2));
    });
  }, [config]);

  const handleMarketType = useCallback((i: number) => {
    setMarketType(i === 0 ? 'new' : 'secondary');
  }, []);

  const handleSaveSim = useCallback(() => {
    const newSim: SavedSim = {
      id: Date.now(),
      title: `${fmt(price)} ${config.currency} · ${years} yrs`,
      sub: `${fmt2(effectiveRate)}% · ${t('loans.savedSims.justNow')}`,
      monthly: Math.round(monthlyPayment),
    };
    setSavedSims(prev => [newSim, ...prev]);
  }, [price, config.currency, years, effectiveRate, monthlyPayment, t]);

  const handleDeleteSim = useCallback((id: number) => {
    setSavedSims(prev => prev.filter(s => s.id !== id));
  }, []);

  // ── Price input helpers (strip formatting, parse) ─────────────────────────
  const [priceText, setPriceText] = useState(String(price));
  const [netIncomeText, setNetIncomeText] = useState(String(netIncome));
  const [otherLoansText, setOtherLoansText] = useState(String(otherLoans));

  // Sync text when numeric state changes externally (e.g. hydration)
  useEffect(() => { if (hydrated) setPriceText(String(price)); }, [price, hydrated]);
  useEffect(() => { if (hydrated) setNetIncomeText(String(netIncome)); }, [netIncome, hydrated]);
  useEffect(() => { if (hydrated) setOtherLoansText(String(otherLoans)); }, [otherLoans, hydrated]);

  const parseAmount = (text: string): number => {
    const v = parseFloat(text.replace(/[^\d.]/g, ''));
    if (Number.isNaN(v)) return 0;
    return Math.max(0, v);
  };

  // ── Styles (using palette from useTheme) ──────────────────────────────────
  const s = useMemo(() => makeStyles(palette), [palette]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Fixed header ────────────────────────────────────────────────── */}
      <View style={s.header} testID="loans-header">
        <Text style={s.headerTitle}>{t('loans.title')}</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── TMM info banner ─────────────────────────────────────────── */}
        <View style={s.tmmBanner}>
          <Info
            size={14}
            color={palette.textTertiary}
            strokeWidth={1.75}
          />
          <Text style={s.tmmText} testID="tmm-banner">
            {t('loans.tmmBanner', {
              tmm: fmt2(config.tmmRate),
              margin: fmt2(bankMarginDisplay),
              date: '30 Jun 2026',
            })}
          </Text>
        </View>

        {/* ── Ad placeholder (large) ──────────────────────────────────── */}
        <AdBanner
          height={200}
          palette={palette}
          label={t('loans.adPlaceholder')}
          sub="370 × 200"
        />

        {/* ── Inputs card ─────────────────────────────────────────────── */}
        <View style={s.card}>

          {/* Property price */}
          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>{t('loans.inputs.price')}</Text>
            <LoanTextInput
              value={priceText}
              onChangeText={(text) => {
                setPriceText(text);
                const v = parseAmount(text);
                if (v !== price) setPrice(v);
              }}
              suffix={config.currency}
              palette={palette}
              testID="price-input"
            />
          </View>

          {/* Down payment slider */}
          <View style={s.sliderGroup}>
            <View style={s.sliderHeader}>
              <Text style={s.fieldLabel}>{t('loans.inputs.downPayment')}</Text>
              <Text style={s.sliderValue} testID="down-pct-value">
                {downPct}% · {fmt(downAmount)} {config.currency}
              </Text>
            </View>
            <LoanSlider
              value={downPct}
              min={config.minDownPaymentPercent}
              max={config.maxDownPaymentPercent}
              step={1}
              onChange={setDownPct}
              palette={palette}
              testID="down-slider"
            />
          </View>

          {/* Duration slider */}
          <View style={s.sliderGroup}>
            <View style={s.sliderHeader}>
              <Text style={s.fieldLabel}>{t('loans.inputs.duration')}</Text>
              <Text style={s.sliderValue} testID="years-value">
                {t('loans.inputs.yearsValue', { count: years })}
              </Text>
            </View>
            <LoanSlider
              value={years}
              min={config.minLoanTermYears}
              max={config.maxLoanTermYears}
              step={1}
              onChange={setYears}
              palette={palette}
              testID="years-slider"
            />
          </View>

          {/* Interest rate stepper */}
          <View style={s.rateRow}>
            <View style={s.rateLabels}>
              <Text style={s.fieldLabel}>{t('loans.inputs.interestRate')}</Text>
              <Text style={s.rateFormula}>
                {t('loans.inputs.rateFormula', {
                  tmm: fmt2(config.tmmRate),
                  margin: fmt2(bankMarginDisplay),
                })}
              </Text>
            </View>
            <View style={s.rateStepper}>
              <TouchableOpacity
                style={[s.stepBtn, { borderColor: palette.borderStrong }]}
                onPress={handleDecrRate}
                testID="rate-decr"
                accessibilityRole="button"
              >
                <Text style={[s.stepBtnText, { color: palette.textSecondary }]}>−</Text>
              </TouchableOpacity>
              <Text style={s.rateValue} testID="rate-value">
                {fmt2(effectiveRate)}%
              </Text>
              <TouchableOpacity
                style={[s.stepBtn, { borderColor: palette.borderStrong }]}
                onPress={handleIncrRate}
                testID="rate-incr"
                accessibilityRole="button"
              >
                <Text style={[s.stepBtnText, { color: palette.textSecondary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Property type (New / Secondary) */}
          <View style={[s.fieldGroup, s.borderTop]}>
            <Text style={s.fieldLabel}>{t('loans.propertyType.title')}</Text>
            <SegmentControl
              options={[t('loans.propertyType.new'), t('loans.propertyType.secondary')]}
              activeIndex={marketType === 'new' ? 0 : 1}
              onSelect={handleMarketType}
              palette={palette}
              testIDPrefix="market-type-seg"
            />
          </View>

          {/* Transaction costs */}
          <View style={s.txSection}>
            <View style={s.txLabels}>
              <Text style={s.fieldLabel}>{t('loans.inputs.txCosts')}</Text>
              <Text style={s.rateFormula} testID="tx-subtitle">
                {t('loans.inputs.txSubtitle', {
                  amount: fmt(txAmount),
                  currency: config.currency,
                })}
              </Text>
            </View>

            {/* Toggle "More details" */}
            <TouchableOpacity
              style={s.moreDetailsRow}
              onPress={() => setMoreOpen(v => !v)}
              testID="more-details-toggle"
              accessibilityRole="button"
            >
              <ChevronRight
                size={13}
                color={palette.primary}
                strokeWidth={2.25}
                style={{ transform: [{ rotate: moreOpen ? '90deg' : '0deg' }] }}
              />
              <Text style={[s.moreDetailsText, { color: palette.primary }]}>
                {t('loans.inputs.txMoreDetails')}
              </Text>
            </TouchableOpacity>

            {/* More details — cost breakdown */}
            {moreOpen && (
              <View
                style={[
                  s.morePanel,
                  {
                    backgroundColor: palette.surfaceMuted,
                    borderColor: palette.border,
                    borderRadius: radius.md,
                  },
                ]}
              >
                {config.transactionCosts.map((cost) => {
                  // Hide flat costs whose appliesTo excludes current market type
                  if (
                    cost.kind === 'flat' &&
                    cost.appliesTo !== undefined &&
                    !cost.appliesTo.includes(marketType)
                  ) {
                    return null;
                  }
                  const amount = computeCost(cost, price, loanAmount, marketType);
                  return (
                    <View key={cost.key} style={s.taxRow}>
                      <Text style={[s.taxLabel, { color: palette.textPrimary }]}>
                        {t(cost.labelKey)}
                      </Text>
                      <Text style={[s.taxValue, { color: palette.textSecondary }]}>
                        {fmt(amount)} {config.currency}
                      </Text>
                    </View>
                  );
                })}
                <Text style={[s.taxNote, { color: palette.textTertiary }]}>
                  {t('loans.inputs.txNote')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Result card (gradient) ───────────────────────────────────── */}
        <LinearGradient
          colors={[
            'rgba(58,6,153,0.06)',
            'rgba(95,9,254,0.06)',
            'rgba(238,139,96,0.06)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.resultCard, { borderColor: palette.borderBrand }]}
        >
          {/* Monthly payment header */}
          <View style={s.resultHeaderRow}>
            <Text style={[s.resultLabel, { color: palette.primary }]}>
              {t('loans.results.label')}
            </Text>
            <TouchableOpacity
              onPress={() => setDiscOpen(v => !v)}
              style={[s.infoBtn, { backgroundColor: `${palette.primary}1a` }]}
              testID="disc-toggle"
              accessibilityRole="button"
            >
              <Info size={14} color={palette.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Disclosure tooltip */}
          {discOpen && (
            <View style={[s.tooltip, { backgroundColor: palette.textPrimary }]}>
              <Text style={s.tooltipText}>
                {t('loans.results.disclaimer')}
              </Text>
            </View>
          )}

          {/* Amount */}
          <View style={s.amountRow}>
            <Text style={s.monthlyAmount} testID="monthly-amount">
              {fmt(monthlyPayment)}
            </Text>
            <Text style={[s.amountSuffix, { color: palette.textSecondary }]}>
              {config.currency} / mo
            </Text>
          </View>

          {/* Breakdown bar */}
          <View style={s.breakdownBar}>
            {/* eslint-disable-next-line react-native/no-inline-styles */}
            <View style={[s.barSegment, { width: principalW as unknown as number, backgroundColor: palette.primary }]} />
            {/* eslint-disable-next-line react-native/no-inline-styles */}
            <View style={[s.barSegment, { width: interestW as unknown as number, backgroundColor: palette.accent }]} />
            <View style={[s.barSegment, { flex: 1, backgroundColor: palette.primary900 }]} />
          </View>

          {/* Legend */}
          <View style={s.legend}>
            <LegendItem
              color={palette.primary}
              label={t('loans.results.principal', {
                amount: fmt(loanAmount),
                currency: config.currency,
              })}
              palette={palette}
            />
            <LegendItem
              color={palette.accent}
              label={t('loans.results.interest', {
                amount: fmt(totalInterest),
                currency: config.currency,
              })}
              palette={palette}
            />
            <LegendItem
              color={palette.primary900}
              label={t('loans.results.txCosts', {
                amount: fmt(txAmount),
                currency: config.currency,
              })}
              palette={palette}
            />
          </View>

          {/* Grand total */}
          <Text style={[s.totalText, { color: palette.textSecondary }]} testID="grand-total">
            {t('loans.results.total', {
              amount: fmt(grandTotal),
              currency: config.currency,
              years,
            })}
          </Text>
        </LinearGradient>

        {/* ── Ad placeholder (small) ──────────────────────────────────── */}
        <AdBanner
          height={92}
          palette={palette}
          label={t('loans.adPlaceholder')}
          sub="370 × 92"
        />

        {/* ── Eligibility card ─────────────────────────────────────────── */}
        <View style={[s.card, s.cardRelative]}>
          {/* Info button (top-right) */}
          <TouchableOpacity
            style={[s.infoAbsolute, { backgroundColor: `${palette.primary}1a` }]}
            onPress={() => setRatioInfoOpen(v => !v)}
            testID="ratio-info-toggle"
            accessibilityRole="button"
          >
            <Info size={14} color={palette.primary} strokeWidth={2} />
          </TouchableOpacity>

          <Text style={[s.resultLabel, { color: palette.primary }]}>
            {t('loans.eligibility.title')}
          </Text>

          {/* Ratio info tooltip */}
          {ratioInfoOpen && (
            <View style={[s.tooltip, s.tooltipRight, { backgroundColor: palette.textPrimary }]}>
              <Text style={s.tooltipText}>
                {t('loans.eligibility.ratioInfo')}
              </Text>
            </View>
          )}

          {/* Net income input */}
          <View style={s.fieldGroup}>
            <Text style={s.detailLabel}>{t('loans.eligibility.netIncome')}</Text>
            <View
              style={[
                inputStyles.row,
                { borderColor: palette.borderStrong, backgroundColor: palette.neutral100, borderRadius: radius.sm },
              ]}
            >
              <TextInput
                value={netIncomeText}
                onChangeText={(text) => {
                  setNetIncomeText(text);
                  const v = parseAmount(text);
                  setNetIncome(v);
                }}
                keyboardType="decimal-pad"
                style={[inputStyles.field, { color: palette.textPrimary, fontSize: 14 }]}
                testID="net-income-input"
                selectTextOnFocus
              />
              <Text style={[inputStyles.suffix, { color: palette.textTertiary }]}>
                {config.currency}
              </Text>
            </View>
          </View>

          {/* Other loans input */}
          <View style={s.fieldGroup}>
            <Text style={s.detailLabel}>{t('loans.eligibility.otherLoans')}</Text>
            <View
              style={[
                inputStyles.row,
                { borderColor: palette.borderStrong, backgroundColor: palette.neutral100, borderRadius: radius.sm },
              ]}
            >
              <TextInput
                value={otherLoansText}
                onChangeText={(text) => {
                  setOtherLoansText(text);
                  const v = parseAmount(text);
                  setOtherLoans(v);
                }}
                keyboardType="decimal-pad"
                style={[inputStyles.field, { color: palette.textPrimary, fontSize: 14 }]}
                testID="other-loans-input"
                selectTextOnFocus
              />
              <Text style={[inputStyles.suffix, { color: palette.textTertiary }]}>
                {config.currency}
              </Text>
            </View>
          </View>

          {/* Debt ratio bar */}
          <View style={[s.ratioTrack, { backgroundColor: palette.neutral100 }]}>
            {/* Fill */}
            <View
              // eslint-disable-next-line react-native/no-inline-styles
              style={[s.ratioFill, { width: ratioBarW as unknown as number, backgroundColor: ratioColor }]}
            />
            {/* Max ratio marker */}
            <View
              // eslint-disable-next-line react-native/no-inline-styles
              style={[s.ratioMarker, { left: maxRatioBarW as unknown as number, backgroundColor: palette.neutral400 }]}
            />
          </View>

          {/* Ratio text + badge */}
          <View style={s.ratioFooter}>
            <Text style={[s.ratioText, { color: palette.textSecondary }]}>
              {t('loans.eligibility.debtRatio')}{' '}
              <Text style={[s.ratioPct, { color: ratioColor }]} testID="debt-ratio">
                {(debtRatio * 100).toFixed(1)}%
              </Text>
            </Text>
            <View style={[s.eligBadge, { backgroundColor: eligBg }]}>
              <Text style={[s.eligText, { color: eligFg }]} testID="elig-badge">
                {isEligible
                  ? t('loans.eligibility.eligible')
                  : t('loans.eligibility.ineligible')}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Save simulation button ──────────────────────────────────── */}
        <TouchableOpacity
          style={[s.saveBtn, { borderColor: palette.primary }]}
          onPress={handleSaveSim}
          testID="save-sim-btn"
          accessibilityRole="button"
        >
          <Text style={[s.saveBtnText, { color: palette.primary }]}>
            {t('loans.save.button')}
          </Text>
        </TouchableOpacity>

        {/* ── Saved simulations ────────────────────────────────────────── */}
        <View style={s.savedHeader}>
          <Text style={[s.savedTitle, { color: palette.textPrimary }]}>
            {t('loans.savedSims.title')}
          </Text>
          <Text style={[s.savedHint, { color: palette.textTertiary }]}>
            {t('loans.savedSims.hint')}
          </Text>
        </View>

        {savedSims.length === 0 ? (
          <View style={[s.savedEmpty, { borderColor: palette.borderStrong }]}>
            <Text style={[s.savedEmptyText, { color: palette.textTertiary }]} testID="saved-empty">
              {t('loans.savedSims.empty')}
            </Text>
          </View>
        ) : (
          savedSims.map(sim => (
            <SwipeableSimRow
              key={sim.id}
              sim={sim}
              onDelete={() => handleDeleteSim(sim.id)}
              palette={palette}
              currency={config.currency}
              testID={`saved-sim-${sim.id}`}
            />
          ))
        )}

        {/* Bottom padding for tab bar */}
        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── LegendItem ────────────────────────────────────────────────────────────────

function LegendItem({
  color,
  label,
  palette,
}: {
  color: string;
  label: string;
  palette: Palette;
}) {
  return (
    <View style={legendStyles.row}>
      <View style={[legendStyles.dot, { backgroundColor: color }]} />
      <Text style={[legendStyles.label, { color: palette.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

const legendStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 12 },
});

// ── StyleSheet factory ────────────────────────────────────────────────────────

function makeStyles(palette: Palette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: palette.background,
    },
    header: {
      paddingTop: SAFE_TOP + 4,
      paddingBottom: 12,
      paddingHorizontal: 20,
      backgroundColor: palette.surface,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    headerTitle: {
      fontFamily: undefined, // system font (Plus Jakarta Sans loaded separately)
      fontWeight: fontWeight.bold,
      fontSize: 22,
      letterSpacing: -0.01 * 22,
      color: palette.textPrimary,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      gap: 14,
      flexDirection: 'column',
    },
    tmmBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 2,
    },
    tmmText: {
      fontSize: 12,
      color: palette.textSecondary,
      flex: 1,
    },
    card: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: radius.xl,
      padding: 16,
      gap: 16,
    },
    cardRelative: {
      position: 'relative',
    },
    fieldGroup: {
      gap: 6,
    },
    borderTop: {
      borderTopWidth: 1,
      borderTopColor: palette.neutral100,
      paddingTop: 14,
    },
    fieldLabel: {
      fontSize: 13.5,
      fontWeight: fontWeight.semibold,
      color: palette.textPrimary,
    },
    sliderGroup: {
      gap: 9,
    },
    sliderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    sliderValue: {
      fontSize: 14,
      fontWeight: fontWeight.bold,
      color: palette.primary,
    },
    rateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: palette.neutral100,
      paddingTop: 14,
    },
    rateLabels: {
      flex: 1,
      gap: 1,
    },
    rateFormula: {
      fontSize: 11.5,
      color: palette.textTertiary,
    },
    rateStepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    stepBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      backgroundColor: palette.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBtnText: {
      fontSize: 18,
      fontWeight: fontWeight.bold,
      lineHeight: 22,
    },
    rateValue: {
      fontSize: 16,
      fontWeight: fontWeight.bold,
      color: palette.textPrimary,
      minWidth: 54,
      textAlign: 'center',
    },
    txSection: {
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: palette.neutral100,
      paddingTop: 14,
    },
    txLabels: {
      gap: 1,
    },
    moreDetailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    moreDetailsText: {
      fontSize: 12.5,
      fontWeight: fontWeight.semibold,
    },
    morePanel: {
      borderWidth: 1,
      padding: 14,
      gap: 10,
    },
    detailLabel: {
      fontSize: 12,
      fontWeight: fontWeight.semibold,
      color: palette.textSecondary,
    },
    taxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    taxLabel: {
      fontSize: 13,
      flex: 1,
    },
    taxValue: {
      fontSize: 13,
      fontWeight: fontWeight.semibold,
    },
    taxNote: {
      fontSize: 11,
      lineHeight: 16,
      borderTopWidth: 1,
      borderTopColor: palette.border,
      paddingTop: 8,
    },
    resultCard: {
      borderWidth: 1,
      borderRadius: radius.xl,
      padding: 18,
      gap: 10,
      position: 'relative',
    },
    resultHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    resultLabel: {
      fontSize: 12,
      fontWeight: fontWeight.semibold,
      letterSpacing: 0.06 * 12,
      textTransform: 'uppercase',
    },
    infoBtn: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tooltip: {
      position: 'absolute',
      top: 40,
      right: 0,
      zIndex: 10,
      maxWidth: 250,
      borderRadius: radius.md,
      padding: 10,
    },
    tooltipRight: {
      right: 40,
    },
    tooltipText: {
      fontSize: 11.5,
      lineHeight: 17,
      color: '#fff',
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
    },
    monthlyAmount: {
      fontWeight: fontWeight.extrabold,
      fontSize: 36,
      letterSpacing: -0.02 * 36,
      color: palette.textPrimary,
    },
    amountSuffix: {
      fontSize: 15,
      fontWeight: fontWeight.semibold,
    },
    breakdownBar: {
      height: 10,
      borderRadius: 999,
      overflow: 'hidden',
      flexDirection: 'row',
    },
    barSegment: {
      height: '100%',
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      rowGap: 6,
    },
    totalText: {
      fontSize: 12.5,
    },
    infoAbsolute: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
    },
    ratioTrack: {
      height: 8,
      borderRadius: 999,
      overflow: 'hidden',
      position: 'relative',
    },
    ratioFill: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      borderRadius: 999,
    },
    ratioMarker: {
      position: 'absolute',
      top: -2,
      bottom: -2,
      width: 2,
      borderRadius: 2,
    },
    ratioFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
    },
    ratioText: {
      fontSize: 12,
      flex: 1,
      lineHeight: 18,
    },
    ratioPct: {
      fontWeight: fontWeight.bold,
    },
    eligBadge: {
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 999,
      flexShrink: 0,
    },
    eligText: {
      fontSize: 11.5,
      fontWeight: fontWeight.bold,
    },
    saveBtn: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderRadius: radius.md,
      paddingVertical: 13,
      alignItems: 'center',
    },
    saveBtnText: {
      fontSize: 15,
      fontWeight: fontWeight.semibold,
    },
    savedHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      paddingHorizontal: 2,
      paddingTop: 4,
    },
    savedTitle: {
      fontWeight: fontWeight.bold,
      fontSize: 16,
    },
    savedHint: {
      fontSize: 11,
    },
    savedEmpty: {
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderRadius: radius.lg,
      padding: 18,
    },
    savedEmptyText: {
      textAlign: 'center',
      fontSize: 12.5,
    },
  });
}
