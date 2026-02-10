import React, { useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Text, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ticketService } from '../services/api';
import TicketCard from '../components/TicketCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';

export default function TicketListScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchTickets = useCallback(async (currentFilters = filters, pageNum = 1, append = false) => {
    try {
      const params = { ...currentFilters, page: pageNum };
      // Remove empty params
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
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.role}>
            {user?.role === 'admin' ? '🛡️ Administrador' : '👤 Usuário'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('TicketCreate')}
          >
            <Text style={styles.addButtonText}>+ Novo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      {/* List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TicketCard
              ticket={item}
              onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
            />
          )}
          contentContainerStyle={tickets.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#6366F1']} />
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
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  role: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: 20,
  },
});
