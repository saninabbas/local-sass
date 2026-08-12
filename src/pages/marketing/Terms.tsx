import { PageLayout } from '../../components/layout/PageLayout';

export function Terms() {
  return (
    <PageLayout>
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 prose prose-slate">
          <h1 className="text-3xl font-extrabold text-primary mb-8">Terms of Service</h1>
          <p className="text-secondary mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-primary mt-8 mb-4">1. Agreement to Terms</h2>
          <p className="text-secondary mb-4">
            By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
          </p>

          <h2 className="text-xl font-bold text-primary mt-8 mb-4">2. Description of Service</h2>
          <p className="text-secondary mb-4">
            Rankora provides AI-powered digital growth auditing and recommendation services for local businesses. You understand and agree that the Service is provided on an "AS IS" and "AS AVAILABLE" basis.
          </p>

          <h2 className="text-xl font-bold text-primary mt-8 mb-4">3. Accounts</h2>
          <p className="text-secondary mb-4">
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>

          <h2 className="text-xl font-bold text-primary mt-8 mb-4">4. Intellectual Property</h2>
          <p className="text-secondary mb-4">
            The Service and its original content, features and functionality are and will remain the exclusive property of Rankora and its licensors.
          </p>
          
          <h2 className="text-xl font-bold text-primary mt-8 mb-4">5. Contact Us</h2>
          <p className="text-secondary mb-4">
            If you have any questions about these Terms, please contact us at support@rankora.com.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
