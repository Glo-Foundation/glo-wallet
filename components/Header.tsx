import Image from "next/image";

export default function Header() {
  return (
    <nav className="mb-9 mt-6">
      <a href="https://glodollar.org/">
        <Image src="/glo-logo-text.svg" alt="glo logo" width={74} height={26} />
      </a>
    </nav>
  )
}
