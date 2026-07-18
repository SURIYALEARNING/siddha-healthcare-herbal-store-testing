import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  Leaf, 
  Calendar, 
  HelpCircle, 
  Settings, 
  LogOut,
  ChevronRight,
  Search
} from "lucide-react";

interface NavbarProps {
  onSearchToggle?: () => void;
  onConsultationClick?: () => void;
}

export default function Navbar({ onSearchToggle, onConsultationClick }: NavbarProps) {
  const { user, cart, wishlist, logoutUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    // { name: "Shop Remedies", path: "/shop" },
    { name: "Health Blogs", path: "/blogs" },
    { name: "About", path: "/about" },
    { name: "Contact us", path: "/contact" }
  ];

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18 gap-2">
          
          {/* Logo Brand */}
          <Link to="/" className="flex flex-1 items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-siddha-dark rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <div className="text-siddha-gold text-xl sm:text-2xl font-serif">S</div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-siddha-dark font-serif font-bold text-lg sm:text-xl leading-none uppercase tracking-tight truncate">
                Siddha Veda
              </span>
              <span className="hidden md:block text-[10px] text-siddha-dark/60 uppercase tracking-widest leading-none mt-1">
                Ancient Healing for Modern Life
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-siddha-dark py-1.5 border-b-2 ${
                    isActive 
                      ? "text-siddha-dark border-siddha-dark" 
                      : "text-gray-500 border-transparent hover:border-gray-200"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-4 shrink-0">
            {/* Search Trigger */}
            {onSearchToggle && (
              <button 
                onClick={onSearchToggle}
                className="hidden sm:block p-2 text-gray-500 hover:text-siddha-dark hover:bg-gray-50 rounded-full transition-colors"
                title="Search Products"
              >
                <Search className="w-5.5 h-5.5" />
              </button>
            )}

            {/* Book Consult Shortcut */}
            {/* <button
              onClick={onConsultationClick}
              className="hidden lg:flex items-center space-x-1.5 px-3.5 py-1.5 bg-siddha-dark hover:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm shadow-emerald-950/10"
            >
              <Calendar className="w-4 h-4 text-siddha-gold" />
              <span>Book Appointment</span>
            </button> */}

            {/* Wishlist Icon */}
            <Link 
              to="/wishlist" 
              className="p-1.5 sm:p-2 text-gray-500 hover:text-siddha-dark hover:bg-gray-50 rounded-full transition-colors relative"
              title="My Wishlist"
            >
              <Heart className="w-5.5 h-5.5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-siddha-gold rounded-full ring-2 ring-white animate-pulse" />
              )}
            </Link>

            {/* Shopping Bag Icon */}
            <Link 
              to="/cart" 
              className="p-1.5 sm:p-2 text-gray-500 hover:text-siddha-dark hover:bg-gray-50 rounded-full transition-colors relative"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-siddha-gold text-siddha-dark text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Icon & Submenu */}
            {user ? (
              <div className="flex items-center space-x-1 sm:space-x-2 border-l border-gray-100 pl-2 sm:pl-4">
                <Link
                  to={user.isAdmin ? "/admin" : "/account"}
                  className="flex items-center space-x-1 sm:space-x-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-siddha-light flex items-center justify-center text-siddha-dark font-semibold text-xs border border-emerald-100 uppercase group-hover:border-siddha-gold transition-colors">
                    {user.fullName.substring(0, 2)}
                  </div>
                  <span className="hidden md:inline-block text-xs font-semibold text-gray-700 group-hover:text-siddha-dark transition-colors max-w-24 truncate">
                    {user.fullName.split(" ")[0]}
                  </span>
                </Link>
                {user.isAdmin && (
                  <span aria-label="Admin" className="text-[9px] sm:text-[10px] bg-amber-100 text-amber-800 px-1 sm:px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    <span className="sm:hidden">A</span>
                    <span className="hidden sm:inline">Admin</span>
                  </span>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-siddha-light hover:bg-[#cbfcd9] text-siddha-dark border border-emerald-100 rounded-lg text-xs font-semibold transition-colors"
                id="login-nav-btn"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Hamburger Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 text-gray-500 hover:text-siddha-dark rounded-full hover:bg-gray-50"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 pt-3 pb-6 space-y-3.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onConsultationClick) onConsultationClick();
                }}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-siddha-dark text-white rounded-lg text-xs font-medium"
              >
                <Calendar className="w-4 h-4 text-siddha-gold" />
                <span>Book Doctor</span>
              </button>
              <Link
                to="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-gray-50 border border-gray-150 text-gray-700 rounded-lg text-xs font-medium"
              >
                <span>Track Order</span>
              </Link>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-siddha-light text-siddha-dark" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-siddha-dark"
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-gray-150 pt-3">
              {user ? (
                <div className="space-y-1">
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.fullName}</p>
                  </div>
                  <Link
                    to={user.isAdmin ? "/admin" : "/account"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{user.isAdmin ? "Admin Dashboard" : "My Account Dashboard"}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-siddha-light text-siddha-dark font-semibold rounded-lg text-sm border border-emerald-100"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
