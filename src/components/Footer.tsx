import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Youtube, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-bg-dark border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-display font-bold text-white">A</div>
              <span className="text-xl font-display font-bold tracking-tight text-white">AniZen</span>
            </Link>
            <p className="text-gray-500 max-w-sm leading-relaxed mb-6">
              The ultimate destination for anime fans. Discover new worlds, 
              join the discussion, and experience the multiverse of animation 
              like never before.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={Twitter} />
              <SocialLink icon={Youtube} />
              <SocialLink icon={Instagram} />
              <SocialLink icon={Github} />
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-500 hover:text-brand transition-colors text-sm">Top Rated</Link></li>
              <li><Link to="/search" className="text-gray-500 hover:text-brand transition-colors text-sm">New Seasons</Link></li>
              <li><Link to="/search" className="text-gray-500 hover:text-brand transition-colors text-sm">Browse Genres</Link></li>
              <li><Link to="/search" className="text-gray-500 hover:text-brand transition-colors text-sm">Special Offers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link to="/admin-login" className="text-gray-500 hover:text-brand transition-colors text-sm">Admin Portal</Link></li>
              <li><a href="#" className="text-gray-500 hover:text-brand transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-500 hover:text-brand transition-colors text-sm">Terms of Use</a></li>
              <li><a href="#" className="text-gray-500 hover:text-brand transition-colors text-sm">Cookie Settings</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          <p>© 2026 AniZen Media. Powered by AI and the Community.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">License</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ icon: Icon }: { icon: any }) {
  return (
    <a href="#" className="w-10 h-10 glass rounded-xl flex items-center justify-center text-gray-400 hover:text-brand hover:border-brand/40 transition-all">
      <Icon className="w-5 h-5" />
    </a>
  );
}
