type WishlistDetailSidebarProps = {
  noteTitle: string;
  noteBody: string;
};

const WishlistDetailSidebar = ({
  noteTitle,
  noteBody,
}: WishlistDetailSidebarProps) => {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-6">
        <section className="overflow-hidden rounded-3xl border border-purple-400/30 bg-gradient-to-br from-[#3d2258] via-[#2d2145] to-[#1f2036] p-5 shadow-[0_18px_40px_rgba(63,35,99,0.35)]">
          <div className="inline-flex rounded-full border border-purple-300/30 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200">
            Note
          </div>

          <h3 className="mt-4 text-lg font-semibold text-white">{noteTitle}</h3>
          <p className="mt-3 text-sm leading-6 text-purple-100/90">{noteBody}</p>
        </section>
      </div>
    </aside>
  );
};

export default WishlistDetailSidebar;
