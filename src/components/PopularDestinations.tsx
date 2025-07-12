import Link from "next/link";

interface Destination {
  name: string;
  cityId: number;
  image: string;
}

const PopularDestinations = () => {
  const destinations: Destination[] = [
    {
      name: "Jakarta",
      cityId: 159,
      image:
        "https://gsrmrmnpzzklayfvgezl.supabase.co/storage/v1/object/public/landing-page/jakarta.jpg",
    },
    {
      name: "Bandung",
      cityId: 181,
      image:
        "https://gsrmrmnpzzklayfvgezl.supabase.co/storage/v1/object/public/landing-page/bandung.jpg",
    },
    {
      name: "Semarang",
      cityId: 220,
      image:
        "https://gsrmrmnpzzklayfvgezl.supabase.co/storage/v1/object/public/landing-page/semarang.jpg",
    },
    {
      name: "Yogyakarta",
      cityId: 227,
      image:
        "https://gsrmrmnpzzklayfvgezl.supabase.co/storage/v1/object/public/landing-page/yogyakarta.jpg",
    },
    {
      name: "Surabaya",
      cityId: 264,
      image:
        "https://gsrmrmnpzzklayfvgezl.supabase.co/storage/v1/object/public/landing-page/surabaya.jpg",
    },
    {
      name: "Medan",
      cityId: 49,
      image:
        "https://gsrmrmnpzzklayfvgezl.supabase.co/storage/v1/object/public/landing-page/medan.jpg",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Destinasi Populer di Indonesia
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination) => (
          <Link
            key={destination.cityId}
            href={`/search?city_id=${destination.cityId}&check_in=2025-07-13&check_out=2025-07-14&guests=2&page=1`}
            className="group block"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 h-48 md:h-56">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${destination.image})`,
                }}
              />
              <div className="absolute inset-0 bg-slate-800/50 group-hover:bg-slate-800/20 transition-all duration-300" />

              <div className="relative z-10 p-6 h-full flex flex-col justify-center items-center">
                <h3 className="text-white text-xl md:text-2xl font-bold mb-2  transition-colors duration-300">
                  {destination.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularDestinations;
