import Link from "next/link";
import Image from "next/image";

// Ball logo + HTL Braunau logo, linking back to the start page.
export default function BrandMark() {
  return (
    <Link href="/" className="brand-mark" aria-label="Zur Startseite">
      <Image
        src="/logos/Ball-2027_Logo_white.png"
        alt="Ball der HTL Braunau 2027 – Prison Break"
        width={733}
        height={309}
        className="h-11 w-auto"
        priority
        unoptimized
      />
      <span className="brand-mark-divider" aria-hidden="true" />
      <Image
        src="/logos/HTL_Braunau_Logo.png"
        alt="HTL Braunau"
        width={200}
        height={106}
        className="brand-mark-school"
      />
    </Link>
  );
}
