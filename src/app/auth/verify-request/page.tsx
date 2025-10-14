export default function VerifyRequest() {
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
      <p className="text-gray-600 mb-4">
        We've sent you a magic link to sign in. Please check your email and click the link.
      </p>
      <p className="text-sm text-gray-500">
        If you don't see the email, check your spam folder.
      </p>
      <a 
        href="/buyer" 
        className="mt-4 inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Back to Buyer Page
      </a>
    </div>
  );
}
