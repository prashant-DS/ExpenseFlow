import React from "react";
import { Link } from "react-router-dom";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>💸 ExpenseFlow</h4>
          <p>
            Smart expense tracking with natural language processing and seamless
            Google Sheets integration. Manage your finances effortlessly with
            real-time sync and beautiful analytics.
          </p>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <div className="footer-links">
            <Link to="/terms-of-service" className="footer-link">
              📄 Terms of Service
            </Link>
            <Link to="/privacy-policy" className="footer-link">
              🔒 Privacy Policy
            </Link>
          </div>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <div className="footer-links">
            <a
              href="https://github.com/prashant-DS/ExpenseFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              🔗 GitHub Repository
            </a>
            <a
              href="https://github.com/prashant-DS/ExpenseFlow/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              🐛 Report an Issue
            </a>
            <a
              href="https://github.com/prashant-DS/ExpenseFlow/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              💬 Discussions
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2025 ExpenseFlow. Made with ❤️, ☕ and 🤖 by{" "}
          <a
            href="https://github.com/prashant-DS"
            target="_blank"
            rel="noopener noreferrer"
          >
            Prashant Kumar
          </a>{" "}
          | Open Source & Free Forever
        </p>
      </div>
    </footer>
  );
};

export default Footer;
