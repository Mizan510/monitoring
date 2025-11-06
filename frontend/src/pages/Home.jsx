import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <div className="bg-white p-10  flex-col rounded-2xl shadow-2xl text-center max-w-1g">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Welcome to Daily Work
        </h1>
        <p className="text-xl md:text-2xl font-semibold text-gray-800">
        “With sincerity, honesty, and dedication, everyone achieves success.”
        </p>
       <p className="text-lg md:text-xl text-gray-600 mt-2">
        “সততা, নিষ্ঠা ও পরিশ্রমের মাধ্যমে, প্রত্যেকে সাফল্য অর্জন করে।”
        </p>
       <br/>
        <div className="flex justify-center gap-6">
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow hover:bg-blue-700 transition-colors duration-300"
          >
            Login
          </Link>
        </div>
      </div>
      <p className="mt-6 text-gray-700 text-sm">
        &copy; {new Date().getFullYear()} MP Tech (All rights reserved)
      </p>
    </div>
  );
};

export default Home;
