import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaYoutube } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-primary text-primary text-center shadow-lg mt-auto">
      <div className="flex justify-center gap-5 pt-10 pb-10">
        {[
          { Icon: FaFacebookF, link: "https://www.facebook.com/", label: "Facebook" },
          { Icon: FaInstagram, link: "https://www.instagram.com/", label: "Instagram" },
          { Icon: FaTwitter, link: "https://twitter.com/", label: "Twitter" },
          { Icon: FaLinkedinIn, link: "https://www.linkedin.com/", label: "LinkedIn" },
          { Icon: FaYoutube, link: "https://www.youtube.com/", label: "YouTube" },
        ].map(({ Icon, link, label }, i) => (
          <a
            key={i}
            href={link}
            aria-label={label}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-background text-main w-10 h-10 flex items-center justify-center rounded-full text-lg transition-all duration-300 hover:-translate-y-1 hover:bg-primary hover:text-primary"
          >
            <Icon />
          </a>
        ))}
      </div>

      <div className="border-t border-color py-3 text-sm">
        <p>Copyright ©{year}; Designed by Dan and Linh</p>
      </div>
    </footer>
  );
}
