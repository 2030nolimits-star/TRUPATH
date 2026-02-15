declare module 'lucide-react' {
    import { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

    export interface LucideProps extends Partial<SVGProps<SVGSVGElement>> {
        size?: string | number;
        absoluteStrokeWidth?: boolean;
        className?: string; // Add className prop which is used often
        color?: string;
        stroke?: string | number;
    }

    export type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;

    // Icons used in Sidebar & MobileSidebar
    export const CheckSquare: LucideIcon;
    export const Bookmark: LucideIcon;
    export const FolderKanban: LucideIcon;
    export const Calendar: LucideIcon;
    export const BookOpen: LucideIcon;
    export const GraduationCap: LucideIcon;
    export const LayoutDashboard: LucideIcon;
    export const Menu: LucideIcon;

    // Icons used in pages
    export const Plus: LucideIcon;
    export const Trash2: LucideIcon;
    export const Edit: LucideIcon;
    export const CalendarIcon: LucideIcon;
    export const Check: LucideIcon; // Common, adding just in case
    export const ExternalLink: LucideIcon;
    export const BookmarkIcon: LucideIcon;
    export const Trophy: LucideIcon;
    export const PartyPopper: LucideIcon;
    export const Search: LucideIcon;
    export const Bell: LucideIcon;

    // Navigation / Common
    export const ChevronLeft: LucideIcon;
    export const ChevronRight: LucideIcon;
    export const ChevronDown: LucideIcon;
    export const ChevronUp: LucideIcon;
    export const X: LucideIcon;
    export const User: LucideIcon;
    export const Home: LucideIcon;
    export const Settings: LucideIcon;
}
