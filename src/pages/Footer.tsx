import './Footer.css'
import { socialLinks } from '../consts'

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        <div className="footer-left">
          © Artem Lytvyn
        </div>

        <div className="footer-right">
          {socialLinks.map(link => (
            <a key={link.name} href={link.url}>{link.name}</a>
          ))}
        </div>

      </div>
    </footer>
  );
};