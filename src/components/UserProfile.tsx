import capy from "@/assets/capybara-avatar.png";

const UserProfile = () => {
  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      <div className="w-32 h-32 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden">
        <img src={capy} alt="User avatar" className="w-full h-full object-cover" />
      </div>
      <div className="bg-accent text-accent-foreground px-8 py-3 rounded-xl font-bold text-lg w-full text-center">
        Pepito Perez
      </div>
    </div>
  );
};

export default UserProfile;
