import { Link } from "wouter";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-inter font-bold mb-4">
              <span className="text-accent">Alreef</span> Fabric
            </h3>
            <p className="text-gray-300 text-sm">
              Your trusted partner for premium fabrics and textiles in the UAE.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <Link href="/">
                  <span className="hover:text-white cursor-pointer">Silk Fabrics</span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="hover:text-white cursor-pointer">Cotton Blends</span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="hover:text-white cursor-pointer">Wool Materials</span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="hover:text-white cursor-pointer">Synthetic Fabrics</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <Link href="/">
                  <span className="hover:text-white cursor-pointer">Contact Us</span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="hover:text-white cursor-pointer">Size Guide</span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="hover:text-white cursor-pointer">Care Instructions</span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="hover:text-white cursor-pointer">Returns</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <Link href="#">
                <Facebook className="h-5 w-5 text-gray-300 hover:text-white cursor-pointer" />
              </Link>
              <Link href="#">
                <Instagram className="h-5 w-5 text-gray-300 hover:text-white cursor-pointer" />
              </Link>
              <Link href="#">
                <Twitter className="h-5 w-5 text-gray-300 hover:text-white cursor-pointer" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300 text-sm">
          <p>&copy; 2024 Alreef Fabric. All rights reserved. | Currency: AED</p>
        </div>
      </div>
    </footer>
  );
}
