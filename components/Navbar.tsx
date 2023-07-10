import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="mt-4 mb-6 px-6 flex justify-between items-center">
      <a href="https://glodollar.org/">
        <Image src="/glo-logo-text.svg" alt="glo logo" width={74} height={26} />
      </a>
      <Image src="/menu.svg" alt="menu" width={24} height={24} />
    </nav>
  );
}
