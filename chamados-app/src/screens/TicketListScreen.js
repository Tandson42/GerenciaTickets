import React, { useState, useCallback } from 'react';
import {
  View, FlatList, ActivityIndicator, RefreshControl, Text, TouchableOpacity, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ticketService } from '../services/api';
import TicketCard from '../components/TicketCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { typography } from '../themes/typography';
import { spacing } from '../themes/spacing';

export default function TicketListScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { isDesktop, isTablet, responsiveValue } = useResponsive();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const numColumns = responsiveValue({ mobile: 1, tablet: 2, desktop: 3 });

  const fetchTickets = useCallback(async (currentFilters = filters, pageNum = 1, append = false) => {
    try {
      const params = { ...currentFilters, page: pageNum };
      Object.keys(params).forEach(key => { if (!params[key]) delete params[key]; });
      const response = await ticketService.list(params);
      const { data, meta } = response.data;
      if (append) { setTickets(prev => [...prev, ...data]); }
      else { setTickets(data); }
      setPage(meta.current_page);
      setLastPage(meta.last_page);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [filters]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchTickets(filters, 1);
  }, [filters]));

  function handleRefresh() { setRefreshing(true); fetchTickets(filters, 1); }
  function handleLoadMore() {
    if (page < lastPage && !loadingMore) { setLoadingMore(true); fetchTickets(filters, page + 1, true); }
  }
  function handleFilterChange(newFilters) { setFilters(newFilters); setLoading(true); fetchTickets(newFilters, 1); }

  function renderFooter() {
    if (!loadingMore) return null;
    return <View style={{ paddingVertical: spacing.lg }}><ActivityIndicator size="small" color={colors.primary} /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: isDesktop ? spacing.xl : spacing.md,
        paddingTop: spacing.md + 4,
        paddingBottom: spacing.sm + 4,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            {isDesktop && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />}
            <Text style={{
              ...(isDesktop ? typography.h2 : typography.h3),
              color: colors.textPrimary,
            }}>
              {isDesktop ? 'Chamados' : `Olá, ${user?.name?.split(' ')[0]} 👋`}
            </Text>
          </View>
          <Text style={{ ...typography.caption, color: colors.textTertiary, marginTop: 2 }}>
            {isDesktop
              ? `${user?.name} · ${user?.role === 'admin' ? 'Admin' : 'Usuário'}`
              : user?.role === 'admin' ? 'Administrador' : 'Usuário'
            }
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {/* Theme toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              {
                padding: spacing.sm,
                borderRadius: 8,
                backgroundColor: colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.border,
              },
              Platform.OS === 'web' && { cursor: 'pointer' },
            ]}
          >
            <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <Button variant="primary" size={isDesktop ? 'md' : 'sm'} icon="+" onPress={() => navigation.navigate('TicketCreate')}>
            Novo
          </Button>
          <Button variant="danger" size={isDesktop ? 'md' : 'sm'} onPress={logout}>
            Sair
          </Button>
        </View>
      </View>

      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          key={`tickets-${numColumns}`}
          data={tickets}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? { justifyContent: 'flex-start' } : undefined}
          renderItem={({ item }) => (
            <TicketCard ticket={item} onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })} />
          )}
          contentContainerStyle={[
            tickets.length === 0 ? { flexGrow: 1 } : { paddingVertical: spacing.sm },
            isDesktop && {
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              maxWidth: 1400,
              alignSelf: 'center',
              width: '100%',
            },
          ]}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.surface}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
}
