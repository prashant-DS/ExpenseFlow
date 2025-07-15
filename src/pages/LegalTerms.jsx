import React from "react";
import "./Legal.scss";

const LegalTerms = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: July 16, 2025</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using ExpenseFlow ("the Service"), you accept and
            agree to be bound by the terms and provision of this agreement. If
            you do not agree to abide by the above, please do not use this
            service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            ExpenseFlow is a personal expense tracking application that
            integrates with Google Sheets to help users manage their financial
            data. The service allows users to add, view, and analyze their
            expense and income data through a web-based interface.
          </p>
        </section>

        <section>
          <h2>3. User Accounts and Google Integration</h2>
          <p>
            To use ExpenseFlow, you must authenticate with your Google account
            using Google's OAuth 2.0 service. By doing so, you grant ExpenseFlow
            permission to:
          </p>
          <ul>
            <li>
              Create and manage Google Sheets on your behalf for expense
              tracking
            </li>
            <li>Read and write data to these specific sheets</li>
            <li>
              Access your basic Google profile information (name and email)
            </li>
          </ul>
          <p>
            You are responsible for maintaining the confidentiality of your
            Google account credentials and for all activities that occur under
            your account.
          </p>
        </section>

        <section>
          <h2>4. Data Storage and Privacy</h2>
          <p>
            ExpenseFlow does not store your financial data on our servers. All
            your expense and income data is stored in Google Sheets within your
            own Google Drive. We only temporarily process your data to provide
            the service functionality.
          </p>
        </section>

        <section>
          <h2>5. Acceptable Use</h2>
          <p>
            You agree to use ExpenseFlow only for lawful purposes and in
            accordance with these Terms. You agree not to:
          </p>
          <ul>
            <li>Use the service for any illegal or unauthorized purpose</li>
            <li>
              Attempt to gain unauthorized access to any part of the service
            </li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Use the service to transmit harmful or malicious code</li>
          </ul>
        </section>

        <section>
          <h2>6. Intellectual Property</h2>
          <p>
            The ExpenseFlow application, including its original content,
            features, and functionality, is owned by Prashant Kumar and is
            protected by international copyright, trademark, and other
            intellectual property laws.
          </p>
        </section>

        <section>
          <h2>7. Disclaimer of Warranties</h2>
          <p>
            ExpenseFlow is provided "as is" and "as available" without any
            warranties of any kind, either express or implied. We do not warrant
            that the service will be uninterrupted, error-free, or completely
            secure.
          </p>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>
            In no event shall Prashant Kumar or ExpenseFlow be liable for any
            indirect, incidental, special, consequential, or punitive damages,
            including without limitation, loss of profits, data, use, goodwill,
            or other intangible losses, resulting from your use of the service.
          </p>
        </section>

        <section>
          <h2>9. Termination</h2>
          <p>
            You may terminate your use of ExpenseFlow at any time by simply
            discontinuing use of the service and revoking access permissions in
            your Google account settings. We may terminate or suspend your
            access immediately, without prior notice, for any reason whatsoever.
          </p>
        </section>

        <section>
          <h2>10. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time.
            If a revision is material, we will try to provide at least 30 days
            notice prior to any new terms taking effect.
          </p>
        </section>

        <section>
          <h2>11. Governing Law</h2>
          <p>
            These Terms shall be interpreted and governed by the laws of India,
            without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2>12. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please
            contact us through our GitHub repository:
            <a
              href="https://github.com/prashant-DS/ExpenseFlow"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://github.com/prashant-DS/ExpenseFlow
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default LegalTerms;
