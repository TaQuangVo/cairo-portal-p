import LoginButton from "@/components/LoginButton";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-svh flex flex-col items-center justify-center relative mx-6 lg:mx-12 py-6">
      {
        /*
          <div className='flex items-center font-semibold text-sm lg:text-md mb-10 absolute top-0 left-0 underline mt-6 text-primary'>
            <Link href='https://peakam.se/'>PEAK</Link>
            <X className="w-5 lg:w-5"/>
            <Link href='https://sakra.se/sv/'>SÄKRA</Link>
            <X className="w-5 lg:w-5"/>
            <Link href='https://centevo.se/'>CENTEVO</Link>
          </div>
        */
      }
      <div className="absolute top-0 left-0 h-[40px] w-full translate-y-6">
        <Image src="/logo.png" alt="Hero" fill className='object-contain object-left'/>
      </div>
      <main className="w-full h-full flex items-center">
        <div className="md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px] 2xl:max-w-[800px]">
          <h1 className="text-3xl font-bold mb-4 text-primary">Welcome to the Säkra.Peak integration</h1>
          <p className="text-lg">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
          <div className="mt-14 flex items-end">
            <LoginButton />
            <Link href='https://www.google.com/' className="underline ml-5">I'm not supose to be here.</Link>
          </div>
        </div>
        <div className="relative grow h-full max-h-[500px] -translate-y-5">
          <Image src="/hero-image3.png" alt="Hero" fill className='object-contain'/>
        </div>
        <div className="absolute bottom-0 right-0 my-6 text-xs text-right">
          <p>Developed by: Säkra 2025</p>
        </div>
      </main>
    </div>
  );
}