import { BarChart3, Map, FileText, Upload, Factory } from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="flex items-center">
          <div className="logo">
            <Factory className="logo-icon" />
            <div className="logo-text">
              <h1>IntegrityOS</h1>
              <p>Pipeline Inspection System</p>
            </div>
          </div>
          <nav className="nav">
            <NavLink href="/" icon={<BarChart3 className="nav-icon" />}>
              Dashboard
            </NavLink>
            <NavLink href="/map" icon={<Map className="nav-icon" />}>
              Map
            </NavLink>
            <NavLink href="/objects" icon={<FileText className="nav-icon" />}>
              Objects
            </NavLink>
            <NavLink href="/reports" icon={<FileText className="nav-icon" />}>
              Reports
            </NavLink>
            <NavLink href="/import" icon={<Upload className="nav-icon" />}>
              Import
            </NavLink>
          </nav>
        </div>
        <div className="text-sm text-secondary">
          <span className="font-semibold">Трубопроводы: </span>
          <span style={{ color: '#2563eb' }}>MT-01, MT-02, MT-03</span>
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ 
  href, 
  icon, 
  children 
}: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode 
}) => (
  <Link href={href} className="nav-link">
    {icon}
    <span>{children}</span>
  </Link>
);

export default Navbar;