import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Review, InsertReview } from "@shared/schema";

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  ratingDistribution: Record<number, number>;
  isLoading: boolean;
}

export default function ReviewSection({
  productId,
  reviews,
  averageRating,
  ratingDistribution,
  isLoading
}: ReviewSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    userName: "",
    rating: 5,
    comment: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addReviewMutation = useMutation({
    mutationFn: (review: InsertReview) =>
      apiRequest("POST", `/api/products/${productId}/reviews`, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
      setShowReviewForm(false);
      setReviewData({ userName: "", rating: 5, comment: "" });
      toast({
        title: "Review Added",
        description: "Thank you for your review!",
      });
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewData.userName || !reviewData.comment) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    addReviewMutation.mutate({
      productId,
      userName: reviewData.userName,
      rating: reviewData.rating,
      comment: reviewData.comment,
      isVerified: false,
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-cream rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center text-yellow-400 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(averageRating) ? "fill-current" : ""
                }`}
              />
            ))}
          </div>
          <p className="text-muted text-sm">Based on {reviews.length} reviews</p>
        </div>
        
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0;
            const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center">
                <span className="text-sm w-8">{rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                  <div
                    className="bg-accent h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted w-8">{count}</span>
              </div>
            );
          })}
        </div>

        <div>
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="w-full bg-accent hover:bg-accent/90"
          >
            Write a Review
          </Button>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <Input
                  value={reviewData.userName}
                  onChange={(e) => setReviewData(prev => ({ ...prev, userName: e.target.value }))}
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReviewData(prev => ({ ...prev, rating: i + 1 }))}
                      className="text-2xl"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          i < reviewData.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Your Review</label>
                <Textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with this fabric..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={addReviewMutation.isPending}
                  className="bg-accent hover:bg-accent/90"
                >
                  {addReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Individual Reviews */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold">{review.userName}</h4>
                    <div className="flex text-yellow-400 text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating ? "fill-current" : ""
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-muted text-sm">
                      {review.createdAt ? formatTimeAgo(review.createdAt) : 'N/A'}
                    </span>
                    {review.isVerified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-muted mb-3">{review.comment}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted">
                    <button className="hover:text-primary flex items-center">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Helpful
                    </button>
                    <button className="hover:text-primary">Reply</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
