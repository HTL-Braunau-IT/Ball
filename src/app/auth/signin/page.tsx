export default function SignIn() {
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      <p className="text-gray-600">
        Please use the sign-in form on the buyer page to authenticate.
      </p>
      <a 
        href="/buyer" 
        className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Go to Buyer Page
      </a>
    </div>
  );
}
