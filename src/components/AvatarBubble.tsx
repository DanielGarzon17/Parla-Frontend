import logo from "@/assets/logo.png";

const AvatarBubble = () => {
  return (
    <div className="relative">
      <div className="w-24 h-24 rounded-full bg-avatar-bg flex items-center justify-center shadow-lg overflow-hidden">
        <img 
          src={logo} 
          alt="logo" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default AvatarBubble;
