import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Heart, ShoppingCart, User, Menu, X, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Fabrics", href: "/" },
    { name: "Collections", href: "/" },
    { name: "About", href: "/" },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-inter font-bold text-primary cursor-pointer">
                  <span className="text-accent">Alreef</span> Fabric
                </h1>
              </Link>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <span className={`px-3 py-2 text-sm font-medium cursor-pointer ${
                      location === item.href
                        ? "text-accent"
                        : "text-muted hover:text-accent"
                    }`}>
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4 hidden sm:block">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search fabrics..."
                className="w-full pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Mobile search */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 bg-accent text-accent-foreground h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>

            {/* Currency */}
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <Coins className="h-4 w-4 text-accent" />
              <span className="font-medium text-primary">AED</span>
            </div>

            {/* Admin Link */}
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span 
                    className={`block px-3 py-2 text-base font-medium cursor-pointer ${
                      location === item.href
                        ? "text-accent"
                        : "text-muted hover:text-accent"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
              
              {/* Mobile search */}
              <div className="px-3 py-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search fabrics..."
                    className="w-full pl-10 pr-4"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
