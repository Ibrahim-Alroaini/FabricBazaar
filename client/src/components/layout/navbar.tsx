import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Heart, User, Menu, X, Coins, Package, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { CartDrawer } from "@/components/CartDrawer";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Fabrics", href: "/" },
    { name: "Collections", href: "/" },
    { name: "About", href: "/" },
  ];

  return (
    <nav className="bg-card dark:bg-card shadow-xl sticky top-0 z-50 border-b border-luxury-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl sm:text-3xl font-inter font-bold cursor-pointer touch-manipulation">
                  <span className="luxury-gradient bg-clip-text text-transparent">Alreef</span> 
                  <span className="text-foreground ml-1 sm:ml-2">Fabric</span>
                </h1>
              </Link>
            </div>
            <div className="hidden md:block ml-12">
              <div className="flex items-baseline space-x-6">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <span className={`px-4 py-2 text-base font-semibold cursor-pointer transition-all duration-300 ${
                      location === item.href
                        ? "text-luxury-copper border-b-2 border-luxury-copper"
                        : "text-muted-foreground hover:text-luxury-copper"
                    }`}>
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4 sm:mx-6 hidden sm:block">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search luxury fabrics..."
                className="w-full pl-12 pr-4 h-11 sm:h-12 bg-input border-luxury-gold/30 focus:border-luxury-copper text-foreground touch-manipulation"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-luxury-copper h-5 w-5" />
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile search */}
            <Button variant="ghost" size="icon" className="md:hidden h-10 w-10 touch-manipulation">
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-luxury-copper transition-colors h-10 w-10 touch-manipulation">
              <Heart className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <CartDrawer />

            {/* Currency */}
            <div className="hidden sm:flex items-center space-x-2 text-sm bg-luxury-gold/10 px-3 py-2 rounded-full">
              <Coins className="h-4 w-4 text-luxury-copper" />
              <span className="font-bold text-luxury-copper">AED</span>
            </div>

            {/* User Account / Admin */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-2">
                {user?.role === 'admin' && (
                  <>
                    <Link href="/admin">
                      <Button variant="ghost" size="sm">
                        <Package className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                    
                    <Link href="/inventory">
                      <Button variant="ghost" size="sm">
                        <Package className="h-4 w-4 mr-2" />
                        Inventory
                      </Button>
                    </Link>
                    
                    <Link href="/customers">
                      <Button variant="ghost" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Customers
                      </Button>
                    </Link>
                  </>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {user?.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                
                <Link href="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Mobile User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="sm:hidden">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/inventory">Inventory</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/customers">Customers</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="sm:hidden">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 touch-manipulation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-luxury-gold/20 bg-card/95 backdrop-blur-sm">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span 
                    className={`block px-4 py-3 text-base font-medium cursor-pointer rounded-lg touch-manipulation transition-colors ${
                      location === item.href
                        ? "text-luxury-copper bg-luxury-gold/10"
                        : "text-muted-foreground hover:text-luxury-copper hover:bg-luxury-gold/5"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
              
              {/* Mobile Auth/Admin Links */}
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <>
                      <Link href="/admin">
                        <span 
                          className="block px-3 py-2 text-base font-medium cursor-pointer text-muted hover:text-accent"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Dashboard
                        </span>
                      </Link>
                      <Link href="/inventory">
                        <span 
                          className="block px-3 py-2 text-base font-medium cursor-pointer text-muted hover:text-accent"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Inventory
                        </span>
                      </Link>
                      <Link href="/customers">
                        <span 
                          className="block px-3 py-2 text-base font-medium cursor-pointer text-muted hover:text-accent"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Customers
                        </span>
                      </Link>
                    </>
                  )}
                  <button
                    className="block w-full text-left px-3 py-2 text-base font-medium cursor-pointer text-muted hover:text-accent"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Out ({user?.name})
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <span 
                      className="block px-3 py-2 text-base font-medium cursor-pointer text-muted hover:text-accent"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </span>
                  </Link>
                  <Link href="/signup">
                    <span 
                      className="block px-3 py-2 text-base font-medium cursor-pointer text-muted hover:text-accent"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </span>
                  </Link>
                </>
              )}
              
              {/* Mobile search */}
              <div className="px-4 py-3">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search fabrics..."
                    className="w-full pl-10 pr-4 h-12 touch-manipulation border-luxury-gold/30 focus:border-luxury-copper"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-luxury-copper h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
