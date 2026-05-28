import {
  Search,
  Bell,
  Heart,
  Home,
  User,
  BedDouble,
  Bath,
  Ruler,
  MapPin,
  KeyRound,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  X,
  SlidersHorizontal,
  Map,
  Share2,
  Plus,
  Check,
  Star,
  Coins,
  MessageCircle,
  PenLine,
  Gift,
  Building2,
  TrendingUp,
  HelpCircle,
  Lock,
  Shield,
  type LucideProps,
} from 'lucide-react-native';

const icons = {
  search: Search,
  bell: Bell,
  heart: Heart,
  home: Home,
  user: User,
  bed: BedDouble,
  bath: Bath,
  ruler: Ruler,
  'map-pin': MapPin,
  key: KeyRound,
  'credit-card': CreditCard,
  'bar-chart': BarChart3,
  chart: BarChart3,
  settings: Settings,
  logout: LogOut,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  x: X,
  sliders: SlidersHorizontal,
  map: Map,
  share: Share2,
  plus: Plus,
  check: Check,
  star: Star,
  coins: Coins,
  chat: MessageCircle,
  message: MessageCircle,
  edit: PenLine,
  gift: Gift,
  building: Building2,
  agency: Building2,
  'trending-up': TrendingUp,
  help: HelpCircle,
  lock: Lock,
  privacy: Shield,
} as const;

export type IconName = keyof typeof icons;

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

export function Icon({ name, size = 22, color = '#0f0f14', ...props }: IconProps) {
  const LucideIcon = icons[name];
  return <LucideIcon size={size} color={color} {...props} />;
}
