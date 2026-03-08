import { Link } from "react-router-dom";

const LAST_UPDATED = "March 8, 2026";
const CONTACT_EMAIL = "support@giftyapp.live";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 pt-8 pb-16">
      <div className="flex justify-center items-center w-full mb-8">
        <Link to="/dashboard" className="p-3 flex items-center justify-center text-center">
          <img src="/gifty-logo.png" alt="Gifty" className="h-[65px] w-auto" />
        </Link>
      </div>

      <main className="max-w-4xl mx-auto">
        <article className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-lg">
          <header className="border-b border-gray-700 pb-6 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
            <p className="text-gray-300 mt-3 leading-relaxed max-w-3xl">
              This Privacy Policy explains what data we collect, why we collect it, and the choices you have when using Gifty.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Last updated: {LAST_UPDATED} • Contact:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-purple-300 hover:text-purple-200 underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>
            </p>
          </header>

          <nav aria-label="Table of contents" className="bg-gray-700/50 border border-gray-700 rounded-xl p-4 sm:p-5 mb-8">
            <h2 className="text-lg font-semibold text-white mb-3">Contents</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base text-gray-200">
              <li><a href="#data-collect" className="hover:text-purple-200">What Data We Collect</a></li>
              <li><a href="#data-use" className="hover:text-purple-200">How We Use Data</a></li>
              <li><a href="#data-sharing" className="hover:text-purple-200">Third-Party Services and Sharing</a></li>
              <li><a href="#retention" className="hover:text-purple-200">Data Retention</a></li>
              <li><a href="#cookies" className="hover:text-purple-200">Cookies and Similar Technologies</a></li>
              <li><a href="#rights" className="hover:text-purple-200">Your Rights and Choices</a></li>
              <li><a href="#delete-export" className="hover:text-purple-200">Delete Account and Data Access</a></li>
              <li><a href="#security" className="hover:text-purple-200">Security</a></li>
              <li><a href="#changes" className="hover:text-purple-200">Changes to This Policy</a></li>
              <li><a href="#contact" className="hover:text-purple-200">Contact</a></li>
            </ol>
          </nav>

          <div className="space-y-8 text-gray-200 leading-relaxed text-sm sm:text-base">
            <section id="data-collect" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">1. What Data We Collect</h2>
              <p>
                We collect account and profile data you provide, such as email address, username, avatar selection, bio, and optional
                birthday. We also store content you add, including wishlists, items, links, and sharing settings.
              </p>
            </section>

            <section id="data-use" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">2. How We Use Data</h2>
              <p>
                We use this information to operate core product features, authenticate users, display your account data, enable
                collaborative sharing, improve reliability, and communicate essential service updates.
              </p>
            </section>

            <section id="data-sharing" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">3. Third-Party Services and Sharing</h2>
              <p>
                We use trusted providers to run parts of the service, such as Firebase Authentication. We do not sell personal data.
                Data is shared only as needed to provide the service, comply with law, or protect users and platform integrity.
              </p>
            </section>

            <section id="retention" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">4. Data Retention</h2>
              <p>
                We retain data while your account is active and for limited periods required for operations, fraud prevention, and legal
                compliance. Retention windows may vary by data type and obligation.
              </p>
            </section>

            <section id="cookies" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">5. Cookies and Similar Technologies</h2>
              <p>
                We may use cookies or equivalent technologies for authentication state, security, and product performance. You can
                manage browser-level cookie preferences, though some features may not function correctly if disabled.
              </p>
            </section>

            <section id="rights" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">6. Your Rights and Choices</h2>
              <p>
                Depending on your location, you may have rights to access, correct, or request deletion of personal data. You can update
                key profile fields in-app and contact us for additional privacy requests.
              </p>
            </section>

            <section id="delete-export" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">7. Delete Account and Data Access</h2>
              <p>
                You can delete your account from Settings. Account deletion is intended to permanently remove account-linked data.
                If you need help accessing your data before deletion, contact us via the email below.
              </p>
            </section>

            <section id="security" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">8. Security</h2>
              <p>
                We implement technical and organizational safeguards to protect data, but no online service can guarantee absolute
                security. If we detect a material incident, we will respond and notify users when required.
              </p>
            </section>

            <section id="changes" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy as features, providers, or legal requirements evolve. The "Last updated" date reflects
                the most recent revision.
              </p>
            </section>

            <section id="contact" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">10. Contact</h2>
              <p>
                For privacy questions or requests, email{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-purple-300 hover:text-purple-200 underline underline-offset-2">
                  {CONTACT_EMAIL}
                </a>.
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
