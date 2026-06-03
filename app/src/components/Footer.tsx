import { Link } from 'react-router';
import { Code2, Github, Twitter, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yemen-600 to-yemen-800">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-foreground">Yemen API Gateway</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The unified API platform for developers and businesses in Yemen. Access local services through a single, powerful interface.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:bg-yemen-50 hover:text-yemen-600 border">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:bg-yemen-50 hover:text-yemen-600 border">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:bg-yemen-50 hover:text-yemen-600 border">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2.5">
              <li><Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Documentation</Link></li>
              <li><a href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing Plans</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Changelog</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Status Page</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Developers</h3>
            <ul className="space-y-2.5">
              <li><Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Quick Start</Link></li>
              <li><Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Reference</Link></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">SDKs & Libraries</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Community</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Yemen API Gateway. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>Sana'a, Yemen</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
