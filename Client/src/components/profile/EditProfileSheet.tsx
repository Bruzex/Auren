import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { TextField } from '../TextField';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types/social';

type EditProfileSheetProps = {
  open: boolean;
  user: User;
  onClose: () => void;
  onSave: (next: Pick<User, 'name' | 'username' | 'bio'>) => void;
};

export function EditProfileSheet({ open, user, onClose, onSave }: EditProfileSheetProps) {
  const { uploadAvatar } = useAuth();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio ?? '');
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(user.name);
    setUsername(user.username);
    setBio(user.bio ?? '');
    setAvatarPreview(user.avatar);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, user, onClose]);

  const valid = name.trim().length > 0 && username.trim().length > 0;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const newUrl = await uploadAvatar(file);
        setAvatarPreview(newUrl);
      } catch (err) {
        console.warn('Avatar upload failed:', err);
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.form
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            onSubmit={(e) => {
              e.preventDefault();
              if (!valid) return;
              onSave({
                name: name.trim(),
                username: username.trim().replace(/^@/, ''),
                bio: bio.trim(),
              });
            }}
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="glass-strong relative w-full max-w-md rounded-t-[32px] p-6 pb-[max(env(safe-area-inset-bottom),24px)] md:rounded-[32px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />

            <span
              className="mx-auto mb-5 block h-1 w-10 rounded-full bg-white/20 md:hidden"
              aria-hidden="true"
            />
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <h2 id="edit-profile-title" className="text-[16px] font-semibold">
                Edit profile
              </h2>
              <Button type="submit" size="sm" disabled={!valid}>
                Save
              </Button>
            </div>
            <div className="mt-6 flex flex-col items-center gap-3">
              <Avatar user={{ ...user, avatar: avatarPreview }} size={84} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[14px] font-medium text-accent-soft transition-colors duration-150 hover:text-label"
              >
                Change photo
              </button>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <TextField label="Name" value={name} onChange={setName} maxLength={40} />
              <TextField
                label="Username"
                value={username}
                onChange={setUsername}
                prefix="@"
                maxLength={24}
              />
              <TextField label="Bio" value={bio} onChange={setBio} multiline maxLength={150} />
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
