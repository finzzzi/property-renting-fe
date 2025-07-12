import { Search, CreditCard, Award, ShieldCheck, Star } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

const WhyChooseUs = () => {
  const features: Feature[] = [
    {
      icon: <Search className="w-12 h-12" />,
      title: "Pilihan Akomodasi yang Beragam",
      description:
        "Pilihan hotel, vila, resor, apartemen, glamping, dari yang murah hingga yang mewah!",
      bgColor: "bg-slate-50",
      iconColor: "text-blue-600",
    },
    {
      icon: <CreditCard className="w-12 h-12" />,
      title: "Pembayaran Mudah dan Fleksibel",
      description:
        "Pilih kemudahan dengan Bayar di Hotel dan hemat lebih banyak dengan PayLater.",
      bgColor: "bg-slate-50",
      iconColor: "text-cyan-600",
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: "Program Loyalitas Pelanggan",
      description:
        "Tingkatkan level Stay.in Priority untuk mendapat manfaat menakjubkan dan perk khusus.",
      bgColor: "bg-slate-50",
      iconColor: "text-purple-600",
    },
    {
      icon: <ShieldCheck className="w-12 h-12" />,
      title: "Lebih Nyaman dengan CleanAccommodation",
      description:
        "Mengikuti standar kesehatan dan keamanan yang disetujui pemerintah.",
      bgColor: "bg-slate-50",
      iconColor: "text-green-600",
    },
    {
      icon: <Star className="w-12 h-12" />,
      title: "Ulasan Tamu Asli",
      description:
        "Jutaan ulasan terverifikasi dari tamu yang menginap di Stay.in!",
      bgColor: "bg-slate-50",
      iconColor: "text-yellow-600",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Mengapa Memilih Stay.in?
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Dapatkan pengalaman menginap terbaik dengan berbagai keunggulan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group text-center p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-2 bg-white border border-gray-100"
          >
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}
            >
              <div className={feature.iconColor}>{feature.icon}</div>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-4 leading-tight">
              {feature.title}
            </h3>

            <p className="text-gray-600 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyChooseUs;
