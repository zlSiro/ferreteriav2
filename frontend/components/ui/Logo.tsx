import Image from "next/image";

export default function Logo() {
  return (
    <><Image
        src='/logo-ferramas.png'
        alt="Imagen del logo"
        width={60}
        height={60}
      />
      <h1 className="text-3xl font-extrabold text-white">
        Ferreteria{" "}
        <span className="text-green-400 text-xl ">{''}FERRAMAS</span>
      </h1></>
  );
}
