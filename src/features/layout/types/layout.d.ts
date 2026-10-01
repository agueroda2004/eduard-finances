export interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export interface NavbarProps {
  onMenuClick: () => void;
  menuOpen: boolean;
}
