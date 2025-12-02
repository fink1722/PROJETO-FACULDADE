import React from 'react';
import { Star, Clock, Users, MessageCircle, Eye, Award, Globe, CheckCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import type { Mentor } from '../types';
import { getInitials } from '../utils/sessionUtils';

interface EnhancedMentorCardProps {
  mentor: Mentor;
  onBookSession?: (mentorId: string) => void;
  onViewProfile?: (mentorId: string) => void;
  className?: string;
}

const EnhancedMentorCard: React.FC<EnhancedMentorCardProps> = ({
  mentor,
  onBookSession,
  onViewProfile,
  className,
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden">
            {mentor.profileImageUrl ? (
              <img 
                src={mentor.profileImageUrl} 
                alt={mentor.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              getInitials(mentor.name)
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
              <Badge variant="success" size="sm" className="ml-2">
                <CheckCircle size={12} className="mr-1" />
                Gratuito
              </Badge>
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                {renderStars(mentor.rating)}
              </div>
              <span className="text-sm font-medium text-gray-700">{mentor.rating}</span>
              <span className="text-xs text-gray-500">({mentor.totalSessions} avaliações)</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {mentor.bio}
        </p>

        {/* Specialties */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Especialidades</h4>
          <div className="flex flex-wrap gap-1">
            {mentor.specialties.slice(0, 4).map((specialty, index) => (
              <Badge key={index} variant="info" size="sm">
                {specialty}
              </Badge>
            ))}
            {mentor.specialties.length > 4 && (
              <Badge variant="default" size="sm">
                +{mentor.specialties.length - 4}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock size={16} className="text-blue-500" />
            </div>
            <div className="text-sm font-semibold text-gray-900">{mentor.experience}</div>
            <div className="text-xs text-gray-500">anos exp.</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users size={16} className="text-green-500" />
            </div>
            <div className="text-sm font-semibold text-gray-900">{mentor.totalSessions}</div>
            <div className="text-xs text-gray-500">sessões</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Award size={16} className="text-purple-500" />
            </div>
            <div className="text-sm font-semibold text-gray-900">{mentor.certifications?.length || 0}</div>
            <div className="text-xs text-gray-500">certificações</div>
          </div>
        </div>

        {/* Languages */}
        {mentor.languages && mentor.languages.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={14} className="text-gray-500" />
              <h4 className="text-sm font-medium text-gray-700">Idiomas</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {mentor.languages.map((language, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onBookSession?.(mentor.id)}
            className="flex-1"
          >
            <MessageCircle size={16} />
            Agendar Sessão
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProfile?.(mentor.id)}
          >
            <Eye size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedMentorCard;