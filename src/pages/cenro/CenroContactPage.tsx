import { useState } from "react";
import { Phone, MessageSquare, Mail, ExternalLink, MessageCircle, MapPin, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useContact } from "../../context/ContactContext";
import { useToast } from "../../context/ToastContext";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

export function CenroContactPage() {
  const { user } = useAuth();
  const { cenroContact, updateCenroContact } = useContact();
  const { toast } = useToast();

  const [callPhone, setCallPhone] = useState(cenroContact.callPhone ?? "");
  const [smsPhone, setSmsPhone] = useState(cenroContact.smsPhone ?? "");
  const [email, setEmail] = useState(cenroContact.email ?? "");
  const [facebookPage, setFacebookPage] = useState(cenroContact.facebookPage ?? "");
  const [messengerLink, setMessengerLink] = useState(cenroContact.messengerLink ?? "");
  const [address, setAddress] = useState(cenroContact.address ?? "");

  const handleSave = () => {
    updateCenroContact({
      callPhone: callPhone.trim() || undefined,
      smsPhone: smsPhone.trim() || undefined,
      email: email.trim() || undefined,
      facebookPage: facebookPage.trim() || undefined,
      messengerLink: messengerLink.trim() || undefined,
      address: address.trim() || undefined,
      updatedBy: user?.name ?? "CENRO",
    });
    toast({ title: "CENRO contact info saved", description: "Citizens will see the updated details in the public directory.", variant: "success" });
  };

  const previewChannels = [
    callPhone && { icon: Phone, label: callPhone, className: "text-green-700 bg-green-50" },
    smsPhone && { icon: MessageSquare, label: smsPhone, className: "text-blue-700 bg-blue-50" },
    email && { icon: Mail, label: email, className: "text-slate-700 bg-slate-50" },
    facebookPage && { icon: ExternalLink, label: facebookPage, className: "text-indigo-700 bg-indigo-50" },
    messengerLink && { icon: MessageCircle, label: "Messenger", className: "text-purple-700 bg-purple-50" },
  ].filter(Boolean) as { icon: typeof Phone; label: string; className: string }[];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="CENRO Contact Info"
        subtitle="Manage the CENRO contact details shown to the public"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Channels</CardTitle>
          <CardDescription>
            Leave a field blank to hide that channel from citizens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <Phone className="h-3.5 w-3.5 text-green-600" /> Call
              </Label>
              <Input
                value={callPhone}
                onChange={(e) => setCallPhone(e.target.value)}
                placeholder="(049) 545-0100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <MessageSquare className="h-3.5 w-3.5 text-blue-600" /> SMS
              </Label>
              <Input
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                placeholder="0917-049-5450"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <Mail className="h-3.5 w-3.5 text-slate-600" /> Email
              </Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cenro@calamba.gov.ph"
                type="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <ExternalLink className="h-3.5 w-3.5 text-indigo-600" /> Facebook Page
              </Label>
              <Input
                value={facebookPage}
                onChange={(e) => setFacebookPage(e.target.value)}
                placeholder="CENRO Calamba City Official"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <MessageCircle className="h-3.5 w-3.5 text-purple-600" /> Messenger Link
              </Label>
              <Input
                value={messengerLink}
                onChange={(e) => setMessengerLink(e.target.value)}
                placeholder="m.me/cenro.calamba"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5 text-red-500" /> Office Address
              </Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City Hall Compound, Calamba City, Laguna"
              />
            </div>
          </div>

          <Button onClick={handleSave} className="bg-[#16a34a] hover:bg-green-700 gap-2 mt-2">
            <Save className="h-4 w-4" />
            Save CENRO Contact Info
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Citizen Preview</CardTitle>
          <CardDescription>This is how CENRO appears at the top of the public Contact Us directory.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">CENRO — City Environment &amp; Natural Resources Office</p>
            <p className="text-xs text-slate-500 mb-3">Calamba City · For RA 9003 compliance inquiries and audit concerns</p>
            {previewChannels.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {previewChannels.map((ch, i) => {
                  const Icon = ch.icon;
                  return (
                    <span key={i} className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", ch.className)}>
                      <Icon className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[160px]">{ch.label}</span>
                    </span>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">No contact details — fill in at least one channel above.</span>
            )}
            {address && (
              <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                {address}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
