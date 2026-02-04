import Image from 'next/image';

export default function RootLoading() {
  return (
    <div className="bg-background/70 fixed inset-0 z-50 flex h-dvh w-dvw flex-col items-center justify-center backdrop-blur-md">
      <Image
        src="/logo.webp"
        width={136}
        height={27.8}
        alt="DramaX.mn"
        className="animate-pulse object-contain object-center"
        unoptimized
      />
    </div>
  );
}
