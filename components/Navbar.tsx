import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="mb-9">
      <a href="https://glodollar.org/">
        <Image src="/glo-logo.svg" alt="glo logo" width={74} height={26} />
      </a>
    </nav>
  );
}
