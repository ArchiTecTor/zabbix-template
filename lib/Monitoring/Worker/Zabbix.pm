package Monitoring::Worker::Zabbix;
use v5.10;
use Mojo::Base 'Monitoring::Worker::Base';
use Mojo::Base -strict;
use Data::Dumper;

has 'zabbix_id';

sub update {
	my $self = shift;

    $self->app->log->info("update ".$self->zabbix_id);
    $self->app->model->zabbix->zabbix_conf_id($self->zabbix_id);
	
    my $items = $self->app->model->zabbix->db->get_collection('items');
	my $triggers = $self->app->model->zabbix->db->get_collection('triggers');
	my $auto = $self->app->model->zabbix->db->get_collection('autoupdate');

    my $hosts;
    
    my @data = $auto->find({updater => $self->zabbix_id})->all();
    $self->app->log->debug("found ".scalar(@data));

    return unless(scalar @data);

    for my $any (@data){
        push @{$hosts->{$any->{host}}{$any->{type}}}, $any; 
    }

    
    while( my($host, $data) = each %$hosts){
        my $result_items = $self->app->model->zabbix->query(
            method=>'item.getobjects',
            params=>{
                output=>'extend',
                host => $host,
            }
        );
        
        for my $item (@{$data->{item}}){
            
            my ($res) = grep{ $data->{item_by_id}{$_->{itemid}} = $_; $_->{key_} eq $item->{key_} } @$result_items;
            if($res){
                $self->app->log->info("update $res->{itemid}");
                $auto->update({id => $item->{id}}, {'$set' => {'itemids' => $res->{itemid}}});
                eval{
                    $items->insert({id => $item->{id}, x => $res->{lastclock}+0, y => sprintf('%0.2f', $res->{lastvalue})});
                };
            }
        }

        my $result_triggers = $self->app->model->zabbix->query(
            method=>'trigger.getobjects',
            params=>{
                output=>'extend',
                host => $host,
            }
        );
        

        for my $trigger (@{$data->{trigger}}){

            my ($res) = grep{ $_->{description} eq $trigger->{description} } @$result_triggers;
            if($res){
                $self->app->log->info("update trigger $res->{triggerid}");
                
                my ($itemid) = $res->{expression} =~ m|\{(\d+)\}|;
                $auto->update({id => $trigger->{id}}, {'$set' => {'triggerids' => $res->{triggerid}, 'itemid' => $itemid}});
                
                unless($triggers->find_one({id=>$trigger->{id}})){
                    $triggers->insert(
                        {
                            id => $trigger->{id},
                            last_time => $res->{lastchange}+0, 
                            current => $data->{item_by_id}{$itemid}{lastvalue},
                            status => $res->{value}
                            
                        } 
                    );
                }
                else {
                    $triggers->update(
                        {
                            id => $trigger->{id},
                        },
                        {
                            '$set' => { 
                                last_time => $res->{lastchange}+0, 
                                current => $data->{item_by_id}{$itemid}{lastvalue},
                                status => $res->{value}
                            }
                        } 
                    );
                }
            }
        }        
    }
    
}



1;