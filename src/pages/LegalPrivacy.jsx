import React from "react";
import "./Legal.scss";

const LegalPrivacy = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: July 16, 2025</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            ExpenseFlow ("we," "our," or "us") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our expense tracking
            application.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>

          <h3>2.1 Information from Google</h3>
          <p>When you authenticate with Google OAuth, we access:</p>
          <ul>
            <li>
              <strong>Basic Profile Information:</strong> Your name and email
              address from your Google account
            </li>
            <li>
              <strong>Google Sheets Access:</strong> Permission to create, read,
              and modify specific Google Sheets for expense tracking
            </li>
          </ul>

          <h3>2.2 Financial Data</h3>
          <p>
            We process the financial information you input into the application,
            including:
          </p>
          <ul>
            <li>Expense and income amounts</li>
            <li>Transaction dates and descriptions</li>
            <li>Category classifications</li>
            <li>Vendor or source information</li>
          </ul>

          <h3>2.3 Usage Information</h3>
          <p>
            We may collect information about how you use the application for
            improving our service.
          </p>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our expense tracking service</li>
            <li>Create and manage Google Sheets for your financial data</li>
            <li>Process and analyze your expense data as requested</li>
            <li>Authenticate your access to the application</li>
            <li>Improve and optimize our service</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Storage and Security</h2>

          <h3>4.1 Where Your Data is Stored</h3>
          <p>
            <strong>Important:</strong> ExpenseFlow does not store your
            financial data on our servers. All your expense and income data is
            stored directly in Google Sheets within your own Google Drive
            account. We only temporarily process this data to provide service
            functionality.
          </p>

          <h3>4.2 Security Measures</h3>
          <p>
            We implement appropriate technical and organizational measures to
            protect your information, including:
          </p>
          <ul>
            <li>Secure OAuth 2.0 authentication with Google</li>
            <li>Encrypted data transmission using HTTPS</li>
            <li>Limited scope access to only necessary Google APIs</li>
            <li>No permanent storage of financial data on our servers</li>
          </ul>
        </section>

        <section>
          <h2>5. Information Sharing and Disclosure</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal
            information to third parties, except as described in this policy:
          </p>
          <ul>
            <li>
              <strong>Google Services:</strong> We interact with Google APIs to
              provide our service functionality
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose information
              if required by law or to protect our rights
            </li>
            <li>
              <strong>Service Providers:</strong> We may share information with
              trusted service providers who assist in operating our application
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Google API Services User Data Policy Compliance</h2>
          <p>
            ExpenseFlow's use of information received from Google APIs adheres
            to the
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
          <p>
            We only access the minimum necessary data to provide our expense
            tracking functionality and do not use this data for any other
            purposes.
          </p>
        </section>

        <section>
          <h2>7. Your Data Rights</h2>
          <p>You have the following rights regarding your data:</p>
          <ul>
            <li>
              <strong>Access:</strong> You can access your data directly through
              your Google Sheets
            </li>
            <li>
              <strong>Correction:</strong> You can modify your data directly in
              Google Sheets or through our application
            </li>
            <li>
              <strong>Deletion:</strong> You can delete your data by removing
              the Google Sheets or revoking access permissions
            </li>
            <li>
              <strong>Export:</strong> You can export your data directly from
              Google Sheets
            </li>
            <li>
              <strong>Revoke Access:</strong> You can revoke ExpenseFlow's
              access to your Google account at any time through your Google
              account settings
            </li>
          </ul>
        </section>

        <section>
          <h2>8. Third-Party Services</h2>
          <p>ExpenseFlow integrates with the following third-party services:</p>
          <ul>
            <li>
              <strong>Google OAuth 2.0:</strong> For secure authentication
            </li>
            <li>
              <strong>Google Sheets API:</strong> For data storage and
              synchronization
            </li>
            <li>
              <strong>Google Drive API:</strong> For managing spreadsheet files
            </li>
          </ul>
          <p>
            These services have their own privacy policies that govern their use
            of your information.
          </p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            ExpenseFlow is not intended for use by children under the age of 13.
            We do not knowingly collect personal information from children under
            13. If we become aware that we have collected personal information
            from a child under 13, we will take steps to delete such
            information.
          </p>
        </section>

        <section>
          <h2>10. International Data Transfers</h2>
          <p>
            Your data may be processed and stored in various countries where
            Google operates its services. By using ExpenseFlow, you consent to
            the transfer of your information to these countries.
          </p>
        </section>

        <section>
          <h2>11. Data Retention</h2>
          <p>
            Since we do not store your financial data permanently, retention is
            managed through your Google Drive. We only retain temporary
            processing data for the duration of your active session.
            Authentication tokens are managed according to Google's OAuth
            policies.
          </p>
        </section>

        <section>
          <h2>12. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date. You are advised to review this
            Privacy Policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2>13. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data
            practices, please contact us:
          </p>
          <ul>
            <li>
              GitHub:{" "}
              <a
                href="https://github.com/prashant-DS/ExpenseFlow"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://github.com/prashant-DS/ExpenseFlow
              </a>
            </li>
            <li>
              Create an issue in our GitHub repository for any privacy-related
              concerns
            </li>
          </ul>
        </section>

        <section>
          <h2>14. Consent</h2>
          <p>
            By using ExpenseFlow, you consent to the collection and use of your
            information as described in this Privacy Policy.
          </p>
        </section>
      </div>
    </div>
  );
};

export default LegalPrivacy;
