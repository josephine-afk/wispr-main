'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, X, User, Settings, LogOut, HelpCircle, Moon, Sun, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Make auth optional for development
  let user = null;
  let token = null;
  let isConnectedToX = false;
  let checkXConnection = async () => {};
  
  try {
    const auth = useAuth();
    user = auth.user;
    token = auth.token;
    isConnectedToX = auth.isConnectedToX;
    checkXConnection = auth.checkXConnection;
  } catch (error) {
    // Auth provider not available, use defaults
  }
  
  // Only check connection status on client side
  useEffect(() => {
    setIsClient(true);
    
    // Debug: Log user data when component mounts or user changes
    if (user) {
      console.log('Navbar - User data:', {
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        x_avatar_url: user.x_avatar_url,
        bio: user.bio,
        full_user: user
      });
    } else {
      console.log('Navbar - No user data available');
    }
  }, [user]);
  
  const getActiveTab = () => {
    if (pathname === '/projects') return 'projects';
    if (pathname === '/creators') return 'creators';
    return 'mindshare';
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [hoverTab, setHoverTab] = useState<string | null>(null);
  const [isClicking, setIsClicking] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mindshareRef = useRef<HTMLButtonElement>(null);
  const projectsRef = useRef<HTMLButtonElement>(null);
  const creatorsRef = useRef<HTMLButtonElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(getActiveTab());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen || (isDropdownOpen && window.innerWidth < 768)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isDropdownOpen]);

  useEffect(() => {
    const updateIndicator = () => {
      const targetTab = hoverTab || activeTab;
      const targetRef = 
        targetTab === 'mindshare' ? mindshareRef :
        targetTab === 'projects' ? projectsRef :
        creatorsRef;
      
      if (targetRef.current && tabContainerRef.current && logoRef.current) {
        const containerRect = tabContainerRef.current.getBoundingClientRect();
        const buttonRect = targetRef.current.getBoundingClientRect();
        const logoRect = logoRef.current.getBoundingClientRect();
        const dividerWidth = 1 + 8; // 1px divider + mx-1 (8px total margin)
        
        // Calculate position relative to container, accounting for logo section
        const logoSectionWidth = logoRect.width + dividerWidth;
        const newStyle = {
          left: buttonRect.left - containerRect.left,
          width: buttonRect.width,
        };
        
        setIndicatorStyle(newStyle);
      }
    };
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(updateIndicator, 10);
    
    // Update on window resize
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeTab, hoverTab]);

  // Initialize after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check for dark mode preference
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' || 
                   (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (tab: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (
      (tab === 'mindshare' && pathname === '/') ||
      (tab === 'projects' && pathname === '/projects') ||
      (tab === 'creators' && pathname === '/creators')
    ) {
      return; // Already on this page
    }
    setActiveTab(tab);
    if (tab === 'mindshare') router.push('/');
    else if (tab === 'projects') router.push('/projects');
    else if (tab === 'creators') router.push('/creators');
  };

  const handleConnectX = () => {
    setIsConnecting(true);
    
    const apiUrl = 'https://api.wispr.top';
    const callbackUrl = `${window.location.origin}`;
    
    // Direct redirect to API OAuth endpoint - API will redirect back with ?x_connected=true or ?x_error=true
    window.location.href = `${apiUrl}/auth/authorizations/x/new?redirect_uri=${encodeURIComponent(callbackUrl)}`;
  };

  const handleDisconnectX = async () => {
    if (!confirm('Are you sure you want to disconnect your X account?')) {
      return;
    }

    setIsConnecting(true);
    try {
      // Try to call the API disconnect endpoint
      const authToken = token || localStorage.getItem('token');
      if (authToken) {
        const response = await fetch('https://api.wispr.top/auth/x/disconnect', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          console.log('API disconnect failed, clearing local state anyway');
        }
      }
      
      // Clear local state regardless of API response
      localStorage.removeItem('x_connected');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Force reload to reset state
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to disconnect X:', error);
      
      // Still clear local state even if API call fails
      localStorage.removeItem('x_connected');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Force reload
      window.location.href = '/';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className={`pt-8 pb-8 ${
        isMobileMenuOpen || isDropdownOpen 
          ? 'bg-[#e8e8e8] dark:bg-black' 
          : 'bg-gradient-to-b from-[#e8e8e8] dark:from-black via-[#e8e8e8]/95 dark:via-black/95 to-[#e8e8e8]/0 dark:to-transparent'
      }`}>
        <div className="px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
          
          {/* Left - Mobile: Burger + Logo | Desktop: Logo + Tabs */}
          <div className="flex items-center">
            <div ref={tabContainerRef} className="relative inline-flex items-center border border-gray-200 dark:border-gray-800 rounded-lg p-1.5 h-12 bg-white/50 dark:bg-black/30 backdrop-blur-sm">
              {/* Mobile: Burger Menu inside */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mr-1"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              
              {/* Logo */}
              <div ref={logoRef} className="px-2 md:px-3 py-1 flex items-center gap-2 flex-shrink-0">
                <div className="w-5 h-5 flex-shrink-0">
                  <Image
                    src="/wispr-logo.svg"
                    alt="Wispr"
                    width={20}
                    height={20}
                    className="dark:hidden w-full h-full"
                  />
                  <Image
                    src="/wispr-logo-dark.svg"
                    alt="Wispr"
                    width={20}
                    height={20}
                    className="hidden dark:block w-full h-full"
                  />
                </div>
                <span className="font-mono font-bold text-sm text-gray-900 dark:text-white whitespace-nowrap">wispr</span>
              </div>
              
              {/* Divider - Only show on desktop when there are tabs */}
              <div className="hidden md:block w-px h-7 bg-gray-200 dark:bg-gray-700 mx-1" />
              
              {/* Desktop Only: Animated Background Pill */}
              <div
                className={`hidden md:block absolute bg-black dark:bg-white rounded-md ${isInitialized ? 'transition-all duration-200 ease-out' : ''}`}
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  height: 'calc(100% - 12px)',
                  top: '6px',
                  opacity: indicatorStyle.width > 0 ? 1 : 0,
                  transform: isClicking ? 'scale(0.98)' : 'scale(1)',
                }}
              />
              
              {/* Desktop Only: Tab Navigation */}
              <button
                ref={mindshareRef}
                onClick={(e) => handleTabClick('mindshare', e)}
                onMouseEnter={() => setHoverTab('mindshare')}
                onMouseLeave={() => setHoverTab(null)}
                onMouseDown={() => setIsClicking(true)}
                onMouseUp={() => setIsClicking(false)}
                className={`hidden md:block relative z-10 min-w-[80px] px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  hoverTab === 'mindshare' || (!hoverTab && activeTab === 'mindshare')
                    ? 'text-white dark:text-black duration-200 delay-100'
                    : 'text-gray-600 dark:text-gray-400 duration-150'
                }`}
              >
                Mindshare
              </button>
              <button
                ref={projectsRef}
                onClick={(e) => handleTabClick('projects', e)}
                onMouseEnter={() => setHoverTab('projects')}
                onMouseLeave={() => setHoverTab(null)}
                onMouseDown={() => setIsClicking(true)}
                onMouseUp={() => setIsClicking(false)}
                className={`hidden md:block relative z-10 min-w-[70px] px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  hoverTab === 'projects' || (!hoverTab && activeTab === 'projects')
                    ? 'text-white dark:text-black duration-200 delay-100'
                    : 'text-gray-600 dark:text-gray-400 duration-150'
                }`}
              >
                Projects
              </button>
              <button
                ref={creatorsRef}
                onClick={(e) => handleTabClick('creators', e)}
                onMouseEnter={() => setHoverTab('creators')}
                onMouseLeave={() => setHoverTab(null)}
                onMouseDown={() => setIsClicking(true)}
                onMouseUp={() => setIsClicking(false)}
                className={`hidden md:block relative z-10 min-w-[70px] px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  hoverTab === 'creators' || (!hoverTab && activeTab === 'creators')
                    ? 'text-white dark:text-black duration-200 delay-100'
                    : 'text-gray-600 dark:text-gray-400 duration-150'
                }`}
              >
                Creators
              </button>
            </div>
          </div>

          {/* Right: Profile/Connect Button */}
          <div className="flex items-center">
            {!isClient ? (
              // Show Connect button by default until client hydrates
              <button 
                onClick={handleConnectX}
                disabled={isConnecting}
                className="connect-btn group"
              >
                Connect 𝕏
                <div className="icon">
                  <svg className="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                  <span className="icon-text">Connect 𝕏</span>
                </div>
              </button>
            ) : !isConnectedToX ? (
              <button 
                onClick={handleConnectX}
                disabled={isConnecting}
                className="connect-btn group"
              >
                Connect 𝕏
                <div className="icon">
                  <svg className="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                  <span className="icon-text">Connect 𝕏</span>
                </div>
              </button>
            ) : (
              /* Profile Dropdown - Only show when connected */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-12 h-12 p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-black/50 transition-all duration-150"
                >
                  {(user?.avatar_url || user?.x_avatar_url) ? (
                    <img 
                      src={user.avatar_url || user.x_avatar_url} 
                      alt={user?.display_name || user?.username || 'Profile'} 
                      className="w-full h-full rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-md bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {(user?.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>

              {isDropdownOpen && (
                <>
                  {/* Mobile: Full-screen dropdown like burger menu */}
                  <div className="md:hidden fixed inset-0 top-[120px] bg-[#e8e8e8] dark:bg-black z-50">
                    <div className="px-6 py-6 h-full overflow-y-auto flex flex-col">
                      {/* Profile Options */}
                      <div className="space-y-3">
                        <button className="w-full text-left px-5 py-4 font-mono text-base text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-black/30 rounded-lg flex items-center gap-3 transition-colors">
                          <User className="w-5 h-5" />
                          <span>profile</span>
                        </button>
                        
                        <button className="w-full text-left px-5 py-4 font-mono text-base text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-black/30 rounded-lg flex items-center gap-3 transition-colors">
                          <Settings className="w-5 h-5" />
                          <span>settings</span>
                        </button>
                        
                        <button 
                          onClick={toggleDarkMode}
                          className="w-full px-5 py-4 text-left font-mono text-base text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-black/30 rounded-lg flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isDarkMode ? (
                              <Moon className="w-5 h-5" />
                            ) : (
                              <Sun className="w-5 h-5" />
                            )}
                            <span>dark_mode</span>
                          </div>
                          <code className="text-sm px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
                            {isDarkMode ? 'on' : 'off'}
                          </code>
                        </button>
                        
                        <button className="w-full px-5 py-4 text-left font-mono text-base text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-black/30 rounded-lg flex items-center gap-3 transition-colors">
                          <HelpCircle className="w-5 h-5" />
                          <span>help</span>
                        </button>
                      </div>
                      
                      {/* Spacer */}
                      <div className="flex-1"></div>
                      
                      {/* Bottom section */}
                      <div className="space-y-3 pb-6">
                        <div className="border-t border-gray-200 dark:border-gray-800 mb-4"></div>
                        
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setIsDropdownOpen(false);
                            handleDisconnectX();
                          }}
                          className="w-full px-5 py-4 text-left font-mono text-base text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-black/30 rounded-lg flex items-center gap-3 transition-colors"
                        >
                          <LogOut className="w-5 h-5 text-red-500 dark:text-red-400" />
                          <span className="text-red-600 dark:text-red-400">disconnect_x</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop: Compact dropdown */}
                  <div className="hidden md:block absolute right-0 mt-2 w-72 bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden animate-slideDown">
                    <div className="p-3">
                      <button className="w-full px-4 py-3 text-left font-mono text-sm text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-md flex items-center gap-3 transition-all group">
                        <User className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                        <span className="group-hover:text-gray-900 dark:group-hover:text-white">profile</span>
                        <span className="ml-auto text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </button>
                      
                      <button className="w-full px-4 py-3 text-left font-mono text-sm text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-md flex items-center gap-3 transition-all group">
                        <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                        <span className="group-hover:text-gray-900 dark:group-hover:text-white">settings</span>
                        <span className="ml-auto text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </button>
                      
                      <button 
                        onClick={toggleDarkMode}
                        className="w-full px-4 py-3 text-left font-mono text-sm text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-md flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          {isDarkMode ? (
                            <Moon className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                          ) : (
                            <Sun className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                          )}
                          <span className="group-hover:text-gray-900 dark:group-hover:text-white">dark_mode</span>
                        </div>
                        <code className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
                          {isDarkMode ? 'on' : 'off'}
                        </code>
                      </button>
                      
                      <button className="w-full px-4 py-3 text-left font-mono text-sm text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-md flex items-center gap-3 transition-all group">
                        <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                        <span className="group-hover:text-gray-900 dark:group-hover:text-white">help</span>
                        <span className="ml-auto text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </button>
                      
                      <div className="my-2 mx-4 border-t border-gray-200 dark:border-gray-800"></div>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setIsDropdownOpen(false);
                          handleDisconnectX();
                        }}
                        className="w-full px-4 py-3 text-left font-mono text-sm text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-md flex items-center gap-3 transition-all group"
                      >
                        <LogOut className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-red-500 dark:group-hover:text-red-400" />
                        <span className="group-hover:text-red-600 dark:group-hover:text-red-400">disconnect_x</span>
                        <code className="ml-auto text-xs px-2 py-0.5 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          ⌘D
                        </code>
                      </button>
                    </div>
                    
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">connected</span>
                        </div>
                        <span className="font-mono text-xs text-gray-400 dark:text-gray-500">v1.0.0</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>

    {/* Mobile Menu */}
    {isMobileMenuOpen && (
      <div className="md:hidden fixed inset-0 top-[120px] bg-[#e8e8e8] dark:bg-black z-40">
        <div className="px-6 py-6 h-full overflow-y-auto flex flex-col">
          {/* Navigation Links */}
          <div className="space-y-3">
            <button 
              onClick={() => {
                router.push('/');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-5 py-4 font-mono text-base rounded-lg transition-colors ${
                pathname === '/' 
                  ? 'bg-black text-white dark:bg-white dark:text-black' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-black/30'
              }`}
            >
              mindshare
            </button>
            <button 
              onClick={() => {
                router.push('/projects');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-5 py-4 font-mono text-base rounded-lg transition-colors ${
                pathname === '/projects' 
                  ? 'bg-black text-white dark:bg-white dark:text-black' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-black/30'
              }`}
            >
              projects
            </button>
            <button 
              onClick={() => {
                router.push('/creators');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-5 py-4 font-mono text-base rounded-lg transition-colors ${
                pathname === '/creators' 
                  ? 'bg-black text-white dark:bg-white dark:text-black' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-black/30'
              }`}
            >
              creators
            </button>
          </div>
          
        </div>
      </div>
    )}
  </nav>
  );
}