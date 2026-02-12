import React, { useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Text,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ticketService } from '../services/api';
import TicketCard from '../components/TicketCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import { colors } from '../themes/colors';
import { typography } from '../themes/typography';
import { spacing, shadows } from '../themes/spacing';

export default function TicketListScreen({ navigation }) {
  const { user, logout } = useAuth();
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
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await ticketService.list(params);
      const { data, meta } = response.data;

      if (append) {
        setTickets(prev => [...prev, ...data]);
      } else {
        setTickets(data);
      }
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

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTickets(filters, 1);
    }, [filters])
  );

  function handleRefresh() {
    setRefreshing(true);
    fetchTickets(filters, 1);
  }

  function handleLoadMore() {
    if (page < lastPage && !loadingMore) {
      setLoadingMore(true);
      fetchTickets(filters, page + 1, true);
    }
  }

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
    setLoading(true);
    fetchTickets(newFilters, 1);
  }

  function renderFooter() {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  // FlatList key must change when numColumns changes
  const listKey = `tickets-${numColumns}`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, isDesktop && styles.greetingDesktop]}>
            {isDesktop ? '🎫 Gestão de Chamados' : `Olá, ${user?.name?.split(' ')[0]} 👋`}
          </Text>
          <Text style={styles.role}>
            {isDesktop
              ? `Olá, ${user?.name?.split(' ')[0]} • ${user?.role === 'admin' ? '🛡️ Admin' : '👤 Usuário'}`
              : user?.role === 'admin' ? '🛡️ Administrador' : '👤 Usuário'
            }
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Button
            variant="primary"
            size={isDesktop ? 'md' : 'sm'}
            icon="+"
            onPress={() => navigation.navigate('TicketCreate')}
          >
            Novo Chamado
          </Button>
          <Button
            variant="danger"
            size={isDesktop ? 'md' : 'sm'}
            onPress={logout}
          >
            Sair
          </Button>
        </View>
      </View>

      {/* Filters */}
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      {/* List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          key={listKey}
          data={tickets}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          renderItem={({ item }) => (
            <TicketCard
              ticket={item}
              onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
            />
          )}
          contentContainerStyle={[
            tickets.length === 0 ? styles.emptyContainer : styles.listContent,
            isDesktop && styles.listContentDesktop,
          ]}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm + 4,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerDesktop: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  headerLeft: {},
  greeting: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  greetingDesktop: {
    ...typography.h2,
  },
  role: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  listContentDesktop: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  emptyContainer: {
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
});
