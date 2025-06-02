import Image from "next/image";
import Link from "next/link";

interface Camp {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  status: "active" | "upcoming";
  startDate: string;
  endDate: string;
}

const camps: Camp[] = [
  {
    id: 1,
    title: "Creative Camp",
    description: "ค่ายพัฒนาทักษะการสร้างสรรค์ผ่านศิลปะ การพูด และการสื่อสารหลากรูปแบบ",
    coverImage: "https://zhrlwnjbkaaautzeysuf.supabase.co/storage/v1/object/public/camp//Frame%2020%20(1).png",
    status: "active",
    startDate: "2024-07-01",
    endDate: "2024-07-07",
  },
  {
    id: 2,
    title: "ค่าย YWC 21",
    description: "ค่ายพัฒนาเว็บไซต์สำหรับเยาวชนรุ่นใหม่",
    coverImage: "https://zhrlwnjbkaaautzeysuf.supabase.co/storage/v1/object/public/camp//ywc.png",
    status: "upcoming",
    startDate: "2024-12-01",
    endDate: "2024-12-07",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {camps.map((camp) => (
            <Link href={`/camps/${camp.id}`} key={camp.id}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48">
                  <Image
                    src={camp.coverImage}
                    alt={camp.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      camp.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {camp.status === "active" ? "กำลังเปิดรับสมัคร" : "เร็วๆ นี้"}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{camp.title}</h2>
                  <p className="text-gray-600 mb-4">{camp.description}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>เริ่ม: {new Date(camp.startDate).toLocaleDateString('th-TH')}</span>
                    <span>สิ้นสุด: {new Date(camp.endDate).toLocaleDateString('th-TH')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
