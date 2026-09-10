import PublicHeader from "@/components/layout/PublicHeader";
import { getAnnouncements } from "@/lib/data/public";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto max-w-[760px] px-6 py-14">
        <h1 className="mb-2 font-display text-3xl font-semibold text-navy">
          Announcements
        </h1>
        <p className="mb-10 text-[15px] text-muted">
          All notices from the school.
        </p>

        <ul className="list-none border-t border-bordersoft p-0">
          {announcements.map((announcement) => (
            <li
              key={announcement.id}
              className="border-b border-bordersoft border-l-[3px] border-l-oxblood px-[18px] py-5"
            >
              <p className="text-[15.5px] font-medium text-ink">
                {announcement.title}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[14px] text-muted">
                {announcement.body}
              </p>
              <p className="mt-2 text-[12.5px] text-muted">
                {new Date(announcement.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
          {announcements.length === 0 && (
            <li className="py-6 text-[14px] text-muted">
              No announcements yet.
            </li>
          )}
        </ul>
      </main>
    </div>
  );
}