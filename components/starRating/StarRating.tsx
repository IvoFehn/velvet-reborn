import { Rating } from "@/models/News";

const StarRating: React.FC<{
  rating: Rating;
  onChange: (newRating: Rating) => void;
}> = ({ rating, onChange }) => {
  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value as Rating)}
          className={`p-1 transition-colors duration-200 ${
            value <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          <svg
            className="w-8 h-8 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default StarRating;
