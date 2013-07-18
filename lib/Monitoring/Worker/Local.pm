package Monitoring::Worker::Local;
use v5.10;
use Mojo::Base 'Monitoring::Worker::Base';
use Mojo::Base -strict;

sub update {
	my $self = shift;
	my $col = $self->app->model->base->db->get_collection('items');
	my $triggers = $self->app->model->base->db->get_collection('triggers');

	for my $id (0 .. 3) {
		my $cpu = $self->cpu_avg($id);
		$col->insert({id => "local_cpu$id", y => $cpu, x => time()});
		if($cpu >= 90) {
			$triggers->save({id => 'trigger_cpu_usage'.$id, last_time => time(), current => $cpu, status => 1});
		}
		else {
			$triggers->save({id => 'trigger_cpu_usage'.$id, current => $cpu, status => 0});
		}
	}
	my $memfree = $self->memfree();
	$col->insert({id => "local_mem_free_percent", y => $memfree, x => time()});
	$col->insert({id => "local_mem_usage_percent", y => 100 - $memfree, x => time()});

	my $old = $triggers->find_one({id => 'trigger_memory_usage'}) || {};
	$old->{current} = 100 - $memfree;
	$old->{status} = 0;
	if(100 - $memfree >= 90){
		$old->{last_time} = time();
		$old->{status} = 1;
	}
	
	$triggers->save($old);
}

sub cpu_avg{
	my $self = shift;
	my $id = shift;
	my $stat = `mpstat -P $id | grep -A 5 "\%idle" | tail -n 1 | awk -F " " '\{print 100 - \$11\}'a`;
	$stat =~ s|\s+||g;
	return $stat;
}

sub memfree {
	my $self = shift;
	open my $fh, '<', '/proc/meminfo';
	my @data = <$fh>;
	close $fh;

	my ($total, $free);
	for my $field (@data){
		if($field =~ m|MemTotal\:\s+(\d+)|){
			$total = $1;
		}
		if($field =~ m|MemFree\:\s+(\d+)|){
			$free = $1;
		}
	}

	return int(($free/$total)*100); 
}

1;