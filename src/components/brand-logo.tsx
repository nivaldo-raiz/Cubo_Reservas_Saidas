import Image from "next/image";
import horizontalLogo from "../../CUBO-GLOBAL-SCHOOL-HORIZONTAL-POSITIVO-RGB.png";

export function BrandLogo() {
  return (
    <Image
      className="brand-logo"
      src={horizontalLogo}
      alt="Cubo Global School"
      priority
    />
  );
}
