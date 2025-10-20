import { FaFacebookF, FaInstagram, FaTwitter, FaGooglePlusG, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary text-center shadow-lg flex-1">
      {/* Social Icons */}
      <div className="flex justify-center gap-5 pt-10 pb-10">
        {[
          { Icon: FaFacebookF, link: "https://www.facebook.com/" },
          { Icon: FaInstagram, link: "https://www.instagram.com/" },
          { Icon: FaTwitter, link: "https://twitter.com/" },
          { Icon: FaGooglePlusG, link: "https://plus.google.com/" },
          { Icon: FaYoutube, link: "https://www.youtube.com/" },
        ].map(({ Icon, link }, i) => (
          <a
            key={i}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-background text-main w-10 h-10 flex items-center justify-center rounded-full text-lg transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-500 hover:text-white"
          >
            <Icon />
          </a>
        ))}
      </div>

      <div className="border-t border-gray-700 py-3 text-sm">
        <p>Copyright ©2022; Designed by Dan and Linh</p>
      </div>
    </footer>
  );
}
