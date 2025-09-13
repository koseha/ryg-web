"use client";

import Link from "next/link";
import {
  Crown,
  Users,
  Zap,
  ArrowRight,
  Shield,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import heroBg from "@/assets/hero-bg.jpg";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function HomeContent() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (error) {
      let displayMessage = "";
      switch (error) {
        case "no_session":
          displayMessage = "로그인 세션이 만료되었습니다. 다시 로그인해주세요.";
          break;
        case "oauth_error":
          displayMessage = `OAuth 오류: ${message || "알 수 없는 오류"}`;
          break;
        case "no_code":
          displayMessage = "인증 코드를 받지 못했습니다. 다시 시도해주세요.";
          break;
        case "exchange_failed":
          displayMessage = "인증 코드 교환에 실패했습니다. 다시 시도해주세요.";
          break;
        case "auth_failed":
          displayMessage = "인증에 실패했습니다. 다시 시도해주세요.";
          break;
        case "unexpected":
          displayMessage =
            "예상치 못한 오류가 발생했습니다. 다시 시도해주세요.";
          break;
        case "session_error":
          displayMessage = `세션 오류: ${message || "알 수 없는 오류"}`;
          break;
        case "sign_out":
          displayMessage = "로그아웃되었습니다.";
          break;
        case "timeout":
          displayMessage = "로그인 시간이 초과되었습니다. 다시 시도해주세요.";
          break;
        case "exchange_failed":
          displayMessage = `인증 코드 교환 실패: ${
            message || "알 수 없는 오류"
          }`;
          break;
        default:
          displayMessage = `오류가 발생했습니다: ${error}`;
      }
      setErrorMessage(displayMessage);
    }
  }, [searchParams]);
  const features = [
    {
      icon: Crown,
      title: "우리만의 리그를 만들어보세요",
      description:
        "나만의 리그를 만들고 친구들을 초대하여 게임 커뮤니티를 구성하세요",
      color: "text-primary",
    },
    {
      icon: Zap,
      title: "매치 코드를 생성하고 관리하세요",
      description: "매치 코드를 생성하고 게임을 쉽게 관리하세요",
      color: "text-accent",
    },
    {
      icon: Users,
      title: "함께 즐기는 게임 경험",
      description: "플레이어들과 연결하고 함께 게임을 즐기세요",
      color: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Error Message */}
      {errorMessage && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/95"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroBg.src})` }}
        ></div>

        <div className="relative container mx-auto text-center">
          <div className="animate-float mb-8">
            <Crown className="h-20 w-20 text-primary mx-auto mb-4 animate-glow" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-glow">
            <span className="text-primary">RYG</span>와 함께
            <br />
            <span className="text-primary">게임을 기록하세요</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Record Your Games - 친구들과 리그를 만들고, 매치를 생성하며, 함께
            즐기는 새로운 방법
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              variant="hero"
              size="lg"
              className="text-lg px-8 py-4"
            >
              <Link href="/universe">
                시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4"
            >
              <Link href="/leagues">
                내 리그
                <Shield className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-glow">
              주요 <span className="text-primary">기능</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              RYG (Record Your Games)의 강력한 기능들을 발견해보세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="card-feature group text-center"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="mb-6">
                    <Icon
                      className={`h-12 w-12 mx-auto ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                    />
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {feature.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="card-glass max-w-4xl mx-auto p-12">
            <Trophy className="h-16 w-16 text-primary mx-auto mb-6 animate-float" />

            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow">
              지금 <span className="text-primary">시작하세요</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              모든 매치가 의미있고, 모든 리그가 이야기를 만들어가는 세상으로
              들어오세요
            </p>

            <Button
              asChild
              variant="hero"
              size="lg"
              className="text-xl px-12 py-6"
            >
              <Link href="/universe">
                지금 시작하기
                <Crown className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
