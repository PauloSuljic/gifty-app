import { Link } from "react-router-dom";
import { LEGAL_CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "../shared/constants/legal";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 pt-8 pb-16">
      <div className="flex justify-center items-center w-full mb-8">
        <Link
          to="/dashboard"
          className="p-3 flex items-center justify-center text-center"
        >
          <img
            src="/gifty-logo.png"
            alt="Gifty"
            className="h-[65px] w-auto"
          />
        </Link>
      </div>

      <main className="max-w-4xl mx-auto">
        <article className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-lg">
          <header className="border-b border-gray-700 pb-6 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Terms of Service</h1>
            <p className="text-gray-300 mt-3 leading-relaxed max-w-3xl">
              These Terms govern your use of Gifty. By creating an account or using the service, you agree to follow these Terms.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Last updated: {LEGAL_LAST_UPDATED} • Contact:{" "}
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-purple-300 hover:text-purple-200 underline underline-offset-2">
                {LEGAL_CONTACT_EMAIL}
              </a>
            </p>
          </header>

          <nav aria-label="Table of contents" className="bg-gray-700/50 border border-gray-700 rounded-xl p-4 sm:p-5 mb-8">
            <h2 className="text-lg font-semibold text-white mb-3">Contents</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base text-gray-200">
              <li><a href="#definitions" className="hover:text-purple-200">Definitions</a></li>
              <li><a href="#accounts" className="hover:text-purple-200">Accounts and Eligibility</a></li>
              <li><a href="#acceptable-use" className="hover:text-purple-200">Acceptable Use</a></li>
              <li><a href="#content" className="hover:text-purple-200">User Content and Ownership</a></li>
              <li><a href="#service-availability" className="hover:text-purple-200">Service Availability</a></li>
              <li><a href="#termination" className="hover:text-purple-200">Suspension and Termination</a></li>
              <li><a href="#liability" className="hover:text-purple-200">Disclaimers and Limitation of Liability</a></li>
              <li><a href="#changes" className="hover:text-purple-200">Changes to These Terms</a></li>
              <li><a href="#law" className="hover:text-purple-200">Governing Law</a></li>
              <li><a href="#contact" className="hover:text-purple-200">Contact</a></li>
            </ol>
          </nav>

          <div className="space-y-8 text-gray-200 leading-relaxed text-sm sm:text-base">
            <section id="definitions" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">1. Definitions</h2>
              <p>
                "Gifty", "we", "our", and "us" refer to the Gifty service and operators. "You" means the individual using the service.
                "Content" means text, links, images, and other data you add to your account or wishlists.
              </p>
            </section>

            <section id="accounts" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">2. Accounts and Eligibility</h2>
              <p>
                You must provide accurate account information and keep your login credentials secure. You are responsible for activity
                that happens under your account. If you believe your account is compromised, contact us immediately.
              </p>
            </section>

            <section id="acceptable-use" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">3. Acceptable Use</h2>
              <p>
                You may not use Gifty to break laws, infringe intellectual property rights, harass others, distribute malware, attempt
                unauthorized access, or interfere with service stability. We may remove violating content or limit access when needed.
              </p>
            </section>

            <section id="content" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">4. User Content and Ownership</h2>
              <p>
                You retain ownership of the content you submit. You grant us a limited license to host and process that content only as
                needed to operate and improve Gifty (for example, displaying your wishlist to people you share it with).
              </p>
            </section>

            <section id="service-availability" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">5. Service Availability</h2>
              <p>
                We work to keep Gifty reliable, but we cannot guarantee uninterrupted service. Maintenance, third-party outages, or
                technical incidents may temporarily affect access or performance.
              </p>
            </section>

            <section id="termination" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">6. Suspension and Termination</h2>
              <p>
                You can stop using Gifty at any time and may delete your account in Settings. We may suspend or terminate accounts that
                violate these Terms or pose risk to other users, the service, or legal compliance.
              </p>
            </section>

            <section id="liability" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">7. Disclaimers and Limitation of Liability</h2>
              <p>
                Gifty is provided on an "as is" and "as available" basis. To the extent permitted by law, we disclaim warranties and are
                not liable for indirect, incidental, or consequential damages resulting from use of the service.
              </p>
            </section>

            <section id="changes" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">8. Changes to These Terms</h2>
              <p>
                We may update these Terms as the product evolves or legal requirements change. The "Last updated" date reflects the
                latest revision. Continuing to use Gifty after updates means you accept the revised Terms.
              </p>
            </section>

            <section id="law" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">9. Governing Law</h2>
              <p>
                These Terms are governed by applicable laws of the jurisdiction where the service operator is established, unless
                otherwise required by mandatory consumer-protection laws.
              </p>
            </section>

            <section id="contact" className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">10. Contact</h2>
              <p>
                If you have questions about these Terms, contact us at{" "}
                <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-purple-300 hover:text-purple-200 underline underline-offset-2">
                  {LEGAL_CONTACT_EMAIL}
                </a>.
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
};

export default TermsOfService;
