import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, BookOpen, ShoppingCart, TrendingUp, Search, CheckCircle, XCircle, Shield, UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    APPROVED: { label: "Onaylı", className: "bg-green-100 text-green-800 border-green-200" },
    PENDING: { label: "Bekliyor", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    REJECTED: { label: "Reddedildi", className: "bg-red-100 text-red-800 border-red-200" },
    ACTIVE: { label: "Aktif", className: "bg-green-100 text-green-800 border-green-200" },
    INACTIVE: { label: "İnaktif", className: "bg-gray-100 text-gray-800 border-gray-200" },
    STUDENT: { label: "Öğrenci", className: "bg-blue-100 text-blue-800 border-blue-200" },
    INSTRUCTOR: { label: "Eğitimci", className: "bg-purple-100 text-purple-800 border-purple-200" },
    ADMIN: { label: "Admin", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const config = map[status] ?? { label: status, className: "bg-gray-100 text-gray-800 border-gray-200" };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${config.className}`}>
      {config.label}
    </span>
  );
}

function formatDate(isoStr: string) {
  if (!isoStr) return "-";
  try {
    return new Date(isoStr).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return isoStr;
  }
}

export default function Admin() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [userSearch, setUserSearch] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Stats
  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/stats", undefined, token ?? undefined);
      if (res.ok) return res.json();
      throw new Error("Yetkisiz");
    },
    enabled: !!token && user?.role === "ADMIN",
  });

  // Users
  const { data: users, isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users", undefined, token ?? undefined);
      if (res.ok) return res.json();
      throw new Error("Yetkisiz");
    },
    enabled: !!token && user?.role === "ADMIN",
  });

  // Instructors
  const { data: instructors, isLoading: instrLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/instructors"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/instructors", undefined, token ?? undefined);
      if (res.ok) return res.json();
      throw new Error("Yetkisiz");
    },
    enabled: !!token && user?.role === "ADMIN",
  });

  // Courses
  const { data: courses, isLoading: coursesLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/courses"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/courses", undefined, token ?? undefined);
      if (res.ok) return res.json();
      throw new Error("Yetkisiz");
    },
    enabled: !!token && user?.role === "ADMIN",
  });

  // User deactivate mutation
  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`, undefined, token ?? undefined);
      if (!res.ok) throw new Error("İşlem başarısız");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Kullanıcı devre dışı bırakıldı", description: "Kullanıcı hesabı pasif duruma alındı." });
    },
    onError: () => {
      toast({ title: "Hata", description: "İşlem gerçekleştirilemedi.", variant: "destructive" });
    },
  });

  // User reactivate mutation
  const reactivateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/activate`, {}, token ?? undefined);
      if (!res.ok) throw new Error("İşlem başarısız");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Kullanıcı tekrar aktif edildi", description: "Kullanıcı hesabı aktif duruma alındı." });
    },
    onError: () => {
      toast({ title: "Hata", description: "İşlem gerçekleştirilemedi.", variant: "destructive" });
    },
  });

  // Approve/Reject mutation
  const updateInstructorMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/instructors/${id}`, { status }, token ?? undefined);
      if (!res.ok) throw new Error("İşlem başarısız");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/instructors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: variables.status === "APPROVED" ? "Başvuru onaylandı" : "Başvuru reddedildi",
        description: `Eğitimci durumu "${variables.status === "APPROVED" ? "Onaylı" : "Reddedildi"}" olarak güncellendi.`,
      });
    },
    onError: () => {
      toast({ title: "Hata", description: "İşlem gerçekleştirilemedi.", variant: "destructive" });
    },
  });

  // Access control
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 pt-32 pb-20 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-3">Erişim Reddedildi</h1>
          <p className="text-muted-foreground mb-6">Bu sayfaya erişmek için admin yetkisi gereklidir.</p>
          <Button asChild><Link href="/">Ana Sayfaya Dön</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredUsers = users?.filter((u: any) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q)
    );
  }) ?? [];

  const recentUsers = [...(users ?? [])].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#E8872A]/20 border border-[#E8872A]/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#E8872A]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Admin Paneli</h1>
            <p className="text-sm text-muted-foreground">birgundeogren.com yönetim merkezi</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Kullanıcılar</TabsTrigger>
            <TabsTrigger value="instructors" data-testid="tab-instructors">Eğitimci Başvuruları</TabsTrigger>
            <TabsTrigger value="courses" data-testid="tab-courses">Eğitimler</TabsTrigger>
          </TabsList>

          {/* ── DASHBOARD TAB ── */}
          <TabsContent value="dashboard">
            {/* Stat cards */}
            {statsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Toplam Kullanıcı" value={stats?.totalUsers ?? 0} icon={Users} color="#1A8A7D" />
                <StatCard title="Eğitimci" value={stats?.totalInstructors ?? 0} icon={TrendingUp} color="#E8872A" />
                <StatCard title="Aktif Eğitim" value={stats?.totalCourses ?? 0} icon={BookOpen} color="#1E3A5F" />
                <StatCard title="Sipariş" value={stats?.totalOrders ?? 0} icon={ShoppingCart} color="#6A1B9A" />
              </div>
            )}

            {/* Recent registrations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Son Kayıtlar</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-10" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ad Soyad</TableHead>
                        <TableHead>E-posta</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Kayıt Tarihi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentUsers.map((u: any) => (
                        <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                          <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                          <TableCell><StatusBadge status={u.role} /></TableCell>
                          <TableCell className="text-muted-foreground text-sm">{formatDate(u.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── USERS TAB ── */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-base font-semibold">
                    Toplam {users?.length ?? 0} kayıtlı kullanıcı
                  </CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="İsim veya e-posta ara..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="pl-9 text-sm h-9"
                      data-testid="input-user-search"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-auto">
                {usersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Ad Soyad</TableHead>
                        <TableHead>E-posta</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Kayıt Tarihi</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u: any) => (
                        <TableRow
                          key={u.id}
                          data-testid={`row-user-${u.id}`}
                          className={!u.isActive ? "opacity-50" : ""}
                        >
                          <TableCell className="text-muted-foreground text-xs">{u.id}</TableCell>
                          <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                          <TableCell className="text-sm">{u.email}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{u.phone || "-"}</TableCell>
                          <TableCell><StatusBadge status={u.role} /></TableCell>
                          <TableCell>
                            {u.isActive ? (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-green-100 text-green-800 border-green-200">Aktif</span>
                            ) : (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-gray-100 text-gray-600 border-gray-200">Pasif</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{formatDate(u.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            {u.id !== user?.id && (
                              u.isActive ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => {
                                    if (confirm(`"${u.firstName} ${u.lastName}" kullanıcısını devre dışı bırakmak istediğinize emin misiniz?`)) {
                                      deactivateUserMutation.mutate(u.id);
                                    }
                                  }}
                                  disabled={deactivateUserMutation.isPending}
                                  data-testid={`button-deactivate-${u.id}`}
                                >
                                  <UserX className="w-3.5 h-3.5 mr-1" />
                                  Devre Dışı Bırak
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => reactivateUserMutation.mutate(u.id)}
                                  disabled={reactivateUserMutation.isPending}
                                  data-testid={`button-reactivate-${u.id}`}
                                >
                                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                                  Tekrar Aktif Et
                                </Button>
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {!usersLoading && filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">Kullanıcı bulunamadı.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── INSTRUCTORS TAB ── */}
          <TabsContent value="instructors">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Eğitimci Başvuruları ({instructors?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-auto">
                {instrLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ad Soyad</TableHead>
                        <TableHead>E-posta</TableHead>
                        <TableHead>Uzmanlık</TableHead>
                        <TableHead>Deneyim</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Tarih</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(instructors ?? []).map((instr: any) => {
                        let expertiseList: string[] = [];
                        try {
                          expertiseList = JSON.parse(instr.expertiseAreas ?? "[]");
                        } catch { expertiseList = []; }

                        return (
                          <TableRow key={instr.id} data-testid={`row-instructor-${instr.id}`}>
                            <TableCell className="font-medium">{instr.displayName}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{instr.user?.email ?? "-"}</TableCell>
                            <TableCell className="text-sm">
                              {expertiseList.slice(0, 2).join(", ")}
                              {expertiseList.length > 2 && " ..."}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{instr.experienceYears} yıl</TableCell>
                            <TableCell><StatusBadge status={instr.status} /></TableCell>
                            <TableCell className="text-sm text-muted-foreground">{formatDate(instr.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {instr.status !== "APPROVED" && (
                                  <Button
                                    size="sm"
                                    className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white text-xs"
                                    onClick={() => updateInstructorMutation.mutate({ id: instr.id, status: "APPROVED" })}
                                    disabled={updateInstructorMutation.isPending}
                                    data-testid={`button-approve-${instr.id}`}
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                    Onayla
                                  </Button>
                                )}
                                {instr.status !== "REJECTED" && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => updateInstructorMutation.mutate({ id: instr.id, status: "REJECTED" })}
                                    disabled={updateInstructorMutation.isPending}
                                    data-testid={`button-reject-${instr.id}`}
                                  >
                                    <XCircle className="w-3.5 h-3.5 mr-1" />
                                    Reddet
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
                {!instrLoading && (instructors ?? []).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">Başvuru bulunamadı.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── COURSES TAB ── */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Tüm Eğitimler ({courses?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-auto">
                {coursesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kod</TableHead>
                        <TableHead>Başlık</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Eğitmen</TableHead>
                        <TableHead>Fiyat</TableHead>
                        <TableHead>Puan</TableHead>
                        <TableHead>Durum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(courses ?? []).map((c: any) => (
                        <TableRow key={c.id} data-testid={`row-course-${c.id}`}>
                          <TableCell className="font-mono text-xs text-muted-foreground">{c.code}</TableCell>
                          <TableCell className="font-medium text-sm max-w-[200px] truncate">{c.title}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{c.category?.name ?? "-"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{c.instructor?.displayName ?? "-"}</TableCell>
                          <TableCell className="text-sm font-medium">{(c.price ?? 0).toLocaleString("tr-TR")} TL</TableCell>
                          <TableCell className="text-sm">⭐ {(c.avgRating ?? 0).toFixed(1)}</TableCell>
                          <TableCell><StatusBadge status={c.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
