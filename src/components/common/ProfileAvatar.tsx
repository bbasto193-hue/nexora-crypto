import React from 'react';

interface ProfileAvatarProps {
  name: string;
  picture?: string;
  className: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ name, picture, className }) => (
  <div className={`${className} overflow-hidden`} aria-label={`${name || 'Owner'} profile picture`}>
    {picture ? (
      <img className="h-full w-full object-cover" src={picture} alt="" />
    ) : (
      <span>{name.trim().charAt(0).toUpperCase() || 'U'}</span>
    )}
  </div>
);
