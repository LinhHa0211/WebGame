const Footer = () => {
    return (
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">&copy; {new Date().getFullYear()} Ha Ngoc Linh B2207536. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="/about" className="text-sm hover:text-gray-300 transition-colors">About</a>
              <a href="/contact" className="text-sm hover:text-gray-300 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;