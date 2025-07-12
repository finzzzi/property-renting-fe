import PromoCarousel from "@/components/PromoCarousel";
import PropertySearchForm from "@/components/PropertySearchForm";
import PopularDestinations from "@/components/PopularDestinations";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[450px] md:h-[400px] bg-gradient-to-b from-[#2AACE3] to-[#0078C3] z-0 rounded-b-3xl" />

      <div className="relative z-10">
        <div className="container mx-auto">
          <PromoCarousel />
        </div>

        <div className="container mx-auto px-4 ">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-center mb-6 md:mt-2 text-white">
              Cari Penginapan Terbaik
            </h2>
            <PropertySearchForm />
          </div>
        </div>
      </div>

      {/* Popular Destinations Section */}
      <PopularDestinations />
    </div>
  );
};

export default Home;
