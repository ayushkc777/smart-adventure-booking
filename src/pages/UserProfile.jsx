import { useState } from 'react'
import { Camera, Eye, EyeOff, Lock, Mail, Phone, Save, Trash2, Upload } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionTitle } from '../components/ui/SectionTitle'
import { useAuth } from '../context/useAuth'
import { useExperience } from '../context/useExperience'
import { isValidPhone, minimumPasswordLength } from '../utils/validation'

const languages = ['English', 'Nepali', 'Hindi', 'Chinese', 'French', 'German', 'Spanish']
const MAX_PROFILE_PHOTO_BYTES = 1024 * 1024

export function UserProfile() {
  const { changePassword, currentUser, updateProfile, uploadProfilePhoto } = useAuth()
  const { showToast } = useExperience()
  const [form, setForm] = useState({
    emergencyContact: currentUser.emergencyContact ?? '',
    fullName: currentUser.fullName,
    nationality: currentUser.nationality ?? '',
    phone: currentUser.phone,
    preferredLanguage: currentUser.preferredLanguage ?? 'English',
    profilePhoto: currentUser.profilePhoto ?? '',
  })
  const [passwordForm, setPasswordForm] = useState({
    confirmPassword: '',
    currentPassword: '',
    newPassword: '',
  })
  const [profileTouched, setProfileTouched] = useState({})
  const [passwordTouched, setPasswordTouched] = useState({})
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [profileSubmitting, setProfileSubmitting] = useState(false)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    confirmPassword: false,
    currentPassword: false,
    newPassword: false,
  })

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setProfileMessage('')
  }

  function updatePasswordField(field, value) {
    setPasswordForm((current) => ({ ...current, [field]: value }))
    setPasswordMessage('')
  }

  function validateProfile() {
    const nextErrors = {}

    if (form.fullName.trim().length < 2) {
      nextErrors.fullName = 'Please enter your full name.'
    }

    if (!isValidPhone(form.phone)) {
      nextErrors.phone = 'Please enter a valid phone number.'
    }

    if (!form.nationality.trim()) {
      nextErrors.nationality = 'Please enter your nationality.'
    }

    if (!isValidPhone(form.emergencyContact)) {
      nextErrors.emergencyContact = 'Please enter a valid emergency contact number.'
    }

    if (!form.preferredLanguage) {
      nextErrors.preferredLanguage = 'Please choose a preferred language.'
    }

    return nextErrors
  }

  function validatePassword() {
    const nextErrors = {}

    if (!passwordForm.currentPassword) {
      nextErrors.currentPassword = 'Enter your current password.'
    }

    if (passwordForm.newPassword.length < minimumPasswordLength) {
      nextErrors.newPassword = `Password must be at least ${minimumPasswordLength} characters.`
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    return nextErrors
  }

  const profileErrors = validateProfile()
  const passwordErrors = validatePassword()
  const isProfileValid = Object.keys(profileErrors).length === 0
  const isPasswordValid = Object.keys(passwordErrors).length === 0

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProfileMessage('Please upload an image file.')
      return
    }

    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
      const message = 'Profile photos must be 1 MB or smaller.'
      setProfileMessage(message)
      showToast(message, 'info')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPhotoFile(file)
      updateField('profilePhoto', String(reader.result))
      showToast('Profile photo ready to save.', 'info')
    }
    reader.onerror = () => setProfileMessage('Could not read the selected image.')
    reader.readAsDataURL(file)
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setProfileTouched({
      emergencyContact: true,
      fullName: true,
      nationality: true,
      phone: true,
      preferredLanguage: true,
    })

    if (!isProfileValid || profileSubmitting) return

    setProfileSubmitting(true)
    const profileResult = await updateProfile(form)
    if (!profileResult.ok) {
      setProfileSubmitting(false)
      setProfileMessage(profileResult.message)
      showToast(profileResult.message, 'info')
      return
    }

    let result = profileResult
    if (photoFile) {
      result = await uploadProfilePhoto(photoFile)
      if (result.ok) {
        setPhotoFile(null)
        setForm((current) => ({ ...current, profilePhoto: result.user.profilePhoto ?? current.profilePhoto }))
      }
    }
    setProfileSubmitting(false)

    const message = result.ok ? 'Profile updated successfully.' : result.message
    setProfileMessage(message)
    showToast(message, result.ok ? 'success' : 'info')
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setPasswordTouched({
      confirmPassword: true,
      currentPassword: true,
      newPassword: true,
    })

    if (!isPasswordValid || passwordSubmitting) return

    setPasswordSubmitting(true)
    const result = await changePassword(passwordForm)
    setPasswordSubmitting(false)
    if (!result.ok) {
      setPasswordMessage(result.message)
      showToast(result.message, 'info')
      return
    }

    setPasswordForm({ confirmPassword: '', currentPassword: '', newPassword: '' })
    setPasswordTouched({})
    setPasswordMessage('Password changed successfully.')
    showToast('Password changed successfully.')
  }

  return (
    <>
      <section className="surface-grid border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle
            description="Keep your identity, contact details, emergency contact, and sign-in settings current for smoother booking confirmation."
            eyebrow="Profile"
            title="Traveler account"
          />
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid min-w-0 max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div className="grid min-w-0 gap-6 self-start">
            <Card className="min-w-0 p-6">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <Avatar name={form.fullName} photo={form.profilePhoto} size="xl" />
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-bold text-slate-950">{currentUser.fullName}</h2>
                  <p className="mt-1 flex min-w-0 items-center gap-2 break-all text-sm text-slate-600">
                    <Mail aria-hidden="true" size={16} />
                    {currentUser.email}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                    <Phone aria-hidden="true" size={16} />
                    {currentUser.phone}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-rhododendron-700 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-rhododendron-800">
                  <Upload aria-hidden="true" size={18} />
                  Upload photo
                  <input accept="image/*" className="sr-only" onChange={handlePhotoChange} type="file" />
                </label>
                <Button
                  disabled={!form.profilePhoto}
                  icon={Trash2}
                  onClick={() => {
                    setPhotoFile(null)
                    updateField('profilePhoto', '')
                  }}
                  variant="secondary"
                >
                  Remove photo
                </Button>
              </div>

              <p className="mt-5 flex items-start gap-2 rounded-xl bg-himalaya-50 p-4 text-sm leading-6 text-himalaya-900">
                <Camera aria-hidden="true" className="mt-0.5 shrink-0" size={17} />
                Upload an image up to 1 MB. Your photo is stored in this browser for account
                personalization.
              </p>
            </Card>

            <Card className="min-w-0 p-6">
              <Lock aria-hidden="true" className="text-himalaya-800" size={28} />
              <h2 className="mt-4 text-xl font-bold text-slate-950">Change password</h2>
              <form className="mt-5 grid gap-4" onSubmit={handlePasswordSubmit}>
                <PasswordInput
                  error={passwordTouched.currentPassword ? passwordErrors.currentPassword : ''}
                  label="Current password"
                  onBlur={() => setPasswordTouched((current) => ({ ...current, currentPassword: true }))}
                  onChange={(value) => updatePasswordField('currentPassword', value)}
                  onToggle={() =>
                    setShowPasswords((current) => ({
                      ...current,
                      currentPassword: !current.currentPassword,
                    }))
                  }
                  show={showPasswords.currentPassword}
                  value={passwordForm.currentPassword}
                />
                <PasswordInput
                  error={passwordTouched.newPassword ? passwordErrors.newPassword : ''}
                  label="New password"
                  onBlur={() => setPasswordTouched((current) => ({ ...current, newPassword: true }))}
                  onChange={(value) => updatePasswordField('newPassword', value)}
                  onToggle={() =>
                    setShowPasswords((current) => ({ ...current, newPassword: !current.newPassword }))
                  }
                  show={showPasswords.newPassword}
                  value={passwordForm.newPassword}
                />
                <PasswordInput
                  error={passwordTouched.confirmPassword ? passwordErrors.confirmPassword : ''}
                  label="Confirm new password"
                  onBlur={() => setPasswordTouched((current) => ({ ...current, confirmPassword: true }))}
                  onChange={(value) => updatePasswordField('confirmPassword', value)}
                  onToggle={() =>
                    setShowPasswords((current) => ({
                      ...current,
                      confirmPassword: !current.confirmPassword,
                    }))
                  }
                  show={showPasswords.confirmPassword}
                  value={passwordForm.confirmPassword}
                />

                {passwordMessage ? (
                  <p
                    aria-live="polite"
                    className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                    role="status"
                  >
                    {passwordMessage}
                  </p>
                ) : null}

                <Button disabled={!isPasswordValid || passwordSubmitting} icon={Save} type="submit" variant="accent">
                  {passwordSubmitting ? 'Updating...' : 'Update password'}
                </Button>
              </form>
            </Card>
          </div>

          <Card className="min-w-0 p-6">
            <h2 className="text-xl font-bold text-slate-950">Edit profile</h2>
            <form className="mt-5 grid gap-4" onSubmit={handleProfileSubmit}>
              <ProfileInput
                error={profileTouched.fullName ? profileErrors.fullName : ''}
                label="Full name"
                onBlur={() => setProfileTouched((current) => ({ ...current, fullName: true }))}
                onChange={(value) => updateField('fullName', value)}
                value={form.fullName}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <ProfileInput
                  error={profileTouched.phone ? profileErrors.phone : ''}
                  label="Phone"
                  onBlur={() => setProfileTouched((current) => ({ ...current, phone: true }))}
                  onChange={(value) => updateField('phone', value)}
                  type="tel"
                  value={form.phone}
                />
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Email
                  <input
                    className="premium-input w-full bg-slate-100 text-slate-600"
                    readOnly
                    value={currentUser.email}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ProfileInput
                  error={profileTouched.nationality ? profileErrors.nationality : ''}
                  label="Nationality"
                  onBlur={() => setProfileTouched((current) => ({ ...current, nationality: true }))}
                  onChange={(value) => updateField('nationality', value)}
                  value={form.nationality}
                />
                <ProfileInput
                  error={profileTouched.emergencyContact ? profileErrors.emergencyContact : ''}
                  label="Emergency contact"
                  onBlur={() =>
                    setProfileTouched((current) => ({ ...current, emergencyContact: true }))
                  }
                  onChange={(value) => updateField('emergencyContact', value)}
                  type="tel"
                  value={form.emergencyContact}
                />
              </div>

              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Preferred language
                <select
                  className="premium-select w-full"
                  onBlur={() => setProfileTouched((current) => ({ ...current, preferredLanguage: true }))}
                  onChange={(event) => updateField('preferredLanguage', event.target.value)}
                  value={form.preferredLanguage}
                >
                  {languages.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
                {profileTouched.preferredLanguage && profileErrors.preferredLanguage ? (
                  <span className="text-sm text-red-700" role="alert">
                    {profileErrors.preferredLanguage}
                  </span>
                ) : null}
              </label>

              {profileMessage ? (
                <p
                  aria-live="polite"
                  className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                  role="status"
                >
                  {profileMessage}
                </p>
              ) : null}

              <Button disabled={!isProfileValid || profileSubmitting} icon={Save} type="submit" variant="accent">
                {profileSubmitting ? 'Saving...' : 'Save profile'}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </>
  )
}

function ProfileInput({ error, label, onBlur, onChange, type = 'text', value }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input
        className="premium-input w-full"
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
      {error ? (
        <span className="text-sm text-red-700" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}

function PasswordInput({ error, label, onBlur, onChange, onToggle, show, value }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <span className="relative">
        <input
          aria-label={label}
          className="premium-input w-full pr-11"
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          type={show ? 'text' : 'password'}
          value={value}
        />
        <button
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
          onClick={onToggle}
          type="button"
        >
          {show ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
        </button>
      </span>
      {error ? (
        <span className="text-sm text-red-700" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}
